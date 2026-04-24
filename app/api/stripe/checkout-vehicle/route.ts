// ============================================
// POST /api/stripe/checkout-vehicle - Create Stripe Checkout Session for Vehicle
// ============================================
// Creates a Stripe Checkout Session for a vehicle in the waitlist.
// Marks the payment as PAID in the webhook.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2026-01-28.clover" as any,
});

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        if (auth instanceof NextResponse) return auth;

        const body = await request.json();
        const { vehicleId } = body;

        if (!vehicleId) {
            return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 });
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        if (vehicle.paymentStatus === "PAID") {
            return NextResponse.json({ error: "This vehicle is already paid" }, { status: 400 });
        }

        if (vehicle.totalAmount <= 0) {
            return NextResponse.json({ error: "Total amount must be greater than zero to pay online" }, { status: 400 });
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Vehicle Shipment: ${vehicle.registrationNo}`,
                            description: `${vehicle.ownerName} | ${vehicle.fromLocation} → ${vehicle.toLocation}`,
                        },
                        unit_amount: Math.round(vehicle.totalAmount * 100),
                    },
                    quantity: 1,
                }
            ],
            mode: "payment",
            customer_email: vehicle.ownerEmail || undefined,
            metadata: {
                vehicleId: vehicle.id,
                registrationNo: vehicle.registrationNo,
            },
            success_url: `${SITE_URL}/vehicle-management?payment_success=true&id=${vehicle.id}`,
            cancel_url: `${SITE_URL}/vehicle-management?payment_cancelled=true&id=${vehicle.id}`,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
        console.error("Stripe vehicle checkout error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
