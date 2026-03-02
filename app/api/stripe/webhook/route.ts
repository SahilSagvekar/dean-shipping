// ============================================
// POST /api/stripe/webhook - Stripe Webhook Handler
// ============================================
// Listens for checkout.session.completed events.
// When payment succeeds, automatically marks the Invoice as PAID
// and syncs the status to the linked Cargo/Passenger booking.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "No Stripe signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { invoiceId, invoiceNo } = session.metadata || {};

        if (!invoiceId && !invoiceNo) {
            console.error("No invoice reference in session metadata");
            return NextResponse.json({ received: true });
        }

        try {
            // Find the invoice
            const invoice = await prisma.invoice.findFirst({
                where: invoiceId ? { id: invoiceId } : { invoiceNo: invoiceNo! },
            });

            if (!invoice) {
                console.error("Invoice not found:", invoiceId || invoiceNo);
                return NextResponse.json({ received: true });
            }

            // Mark invoice as PAID
            await prisma.$transaction(async (tx) => {
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        paymentStatus: "PAID",
                        paymentMode: "Online (Stripe)",
                        paidAt: new Date(),
                        paidAmount: invoice.totalAmount,
                    },
                });

                // Sync to cargo booking
                if (invoice.cargoBookingId) {
                    await tx.cargoBooking.update({
                        where: { id: invoice.cargoBookingId },
                        data: { paymentStatus: "PAID" },
                    });
                }

                // Sync to passenger booking
                if (invoice.passengerBookingId) {
                    await tx.passengerBooking.update({
                        where: { id: invoice.passengerBookingId },
                        data: { paymentStatus: "PAID" },
                    });
                }

                // Audit log
                await tx.auditLog.create({
                    data: {
                        action: "PAYMENT_RECEIVED",
                        entity: "invoice",
                        entityId: invoice.id,
                        metadata: {
                            invoiceNo: invoice.invoiceNo,
                            amount: invoice.totalAmount,
                            stripeSessionId: session.id,
                            paymentMethod: "Stripe",
                        },
                    },
                });
            });

            console.log(`✅ Invoice ${invoice.invoiceNo} marked as PAID via Stripe`);
        } catch (error) {
            console.error("Failed to update invoice after payment:", error);
        }
    }

    return NextResponse.json({ received: true });
}
