// ============================================
// POST /api/stripe/checkout - Create Stripe Checkout Session
// ============================================
// Looks up an invoice by invoiceNo (public, no auth needed so users can
// pay without logging in), creates a Stripe Checkout Session and returns
// the session URL for redirect.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { invoiceNo } = body;

        if (!invoiceNo) {
            return NextResponse.json(
                { error: "Invoice number is required" },
                { status: 400 }
            );
        }

        // Look up the invoice
        const invoice = await prisma.invoice.findFirst({
            where: { invoiceNo },
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                cargoBooking: {
                    select: {
                        fromLocation: true,
                        toLocation: true,
                        service: true,
                        items: { select: { itemType: true, quantity: true, unitPrice: true, total: true } },
                    },
                },
                passengerBooking: {
                    select: {
                        fromLocation: true,
                        toLocation: true,
                        adultCount: true,
                        childCount: true,
                        infantCount: true,
                    },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        if (invoice.paymentStatus === "PAID") {
            return NextResponse.json(
                { error: "This invoice has already been paid" },
                { status: 400 }
            );
        }

        // Build line items from cargo booking items, or fallback to invoice total
        let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        if (invoice.cargoBooking?.items && invoice.cargoBooking.items.length > 0) {
            lineItems = invoice.cargoBooking.items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.itemType,
                        description: `${invoice.cargoBooking!.fromLocation} → ${invoice.cargoBooking!.toLocation}`,
                    },
                    unit_amount: Math.round(item.unitPrice * 100), // in cents
                },
                quantity: item.quantity,
            }));

            // Add VAT as a separate line item
            if (invoice.vatAmount > 0) {
                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "VAT (12%)",
                        },
                        unit_amount: Math.round(invoice.vatAmount * 100),
                    },
                    quantity: 1,
                });
            }
        } else if (invoice.passengerBooking) {
            const pb = invoice.passengerBooking;
            lineItems = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Passenger Ticket",
                            description: `${pb.fromLocation} → ${pb.toLocation} (${pb.adultCount} adult, ${pb.childCount} child, ${pb.infantCount} infant)`,
                        },
                        unit_amount: Math.round(invoice.subtotal * 100),
                    },
                    quantity: 1,
                },
            ];
            if (invoice.vatAmount > 0) {
                lineItems.push({
                    price_data: {
                        currency: "usd",
                        product_data: { name: "VAT (12%)" },
                        unit_amount: Math.round(invoice.vatAmount * 100),
                    },
                    quantity: 1,
                });
            }
        } else {
            // Generic fallback
            lineItems = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Invoice #${invoice.invoiceNo}`,
                            description: "Dean's Shipping Ltd — Payment",
                        },
                        unit_amount: Math.round(invoice.totalAmount * 100),
                    },
                    quantity: 1,
                },
            ];
        }

        // Create the Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: invoice.user?.email || undefined,
            metadata: {
                invoiceId: invoice.id,
                invoiceNo: invoice.invoiceNo,
            },
            success_url: `${SITE_URL}/paynow/success?session_id={CHECKOUT_SESSION_ID}&invoiceNo=${invoice.invoiceNo}`,
            cancel_url: `${SITE_URL}/paynow?invoiceNo=${invoice.invoiceNo}&cancelled=true`,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
