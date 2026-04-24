// ============================================
// POST /api/stripe/webhook - Stripe Webhook Handler
// ============================================
// Listens for checkout.session.completed events.
// When payment succeeds, automatically marks the Invoice as PAID,
// syncs the status to the linked Cargo/Passenger booking,
// and sends email notifications to the admin and the agent who created the booking.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Lazy-init Stripe to prevent build-time crashes if STRIPE_SECRET_KEY is missing
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2026-01-28.clover",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Payment confirmation email template
function getPaymentConfirmationEmail(data: {
    recipientName: string;
    invoiceNo: string;
    customerName: string;
    amount: number;
    route: string;
    bookingType: string;
    paymentMethod: string;
    isAdmin: boolean;
}) {
    const subject = `Payment Received — Invoice #${data.invoiceNo} ($${data.amount.toFixed(2)})`;

    return {
        subject,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #296341; color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0;">PAYMENT RECEIVED</h1>
      <p style="margin: 5px 0 0; opacity: 0.8;">Dean's Shipping Ltd</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="margin-top: 0;">Hello ${data.recipientName},</h2>
      <p>A payment has been successfully processed${data.isAdmin ? '' : ' for a booking you created'}.</p>

      <div style="background: #f4faf7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Invoice #</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.invoiceNo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Customer</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Amount</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #296341; font-size: 18px;">$${data.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Route</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.route}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Type</td>
            <td style="padding: 8px 0; text-align: right;">${data.bookingType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Payment Via</td>
            <td style="padding: 8px 0; text-align: right;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Status</td>
            <td style="padding: 8px 0; text-align: right;"><span style="background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">PAID ✓</span></td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${SITE_URL}/cashier" style="display: inline-block; padding: 12px 25px; background-color: #296341; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Cashier</a>
      </div>
    </div>
    <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777;">
      <p>&copy; ${new Date().getFullYear()} Dean's Shipping Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    };
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "No Stripe signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { invoiceId, invoiceNo, vehicleId } = session.metadata || {};

        if (!invoiceId && !invoiceNo && !vehicleId) {
            console.error("No invoice or vehicle reference in session metadata");
            return NextResponse.json({ received: true });
        }

        try {
            // CASE 1: VEHICLE PAYMENT
            if (vehicleId) {
                const vehicle = await prisma.vehicle.findUnique({
                    where: { id: vehicleId }
                });

                if (!vehicle) {
                    console.error("Vehicle not found from metadata ID:", vehicleId);
                    return NextResponse.json({ received: true });
                }

                await prisma.$transaction(async (tx) => {
                    await tx.vehicle.update({
                        where: { id: vehicle.id },
                        data: {
                            paymentStatus: "PAID",
                            paymentMode: "Online (Stripe)",
                            paidAt: new Date(),
                        },
                    });

                    await tx.auditLog.create({
                        data: {
                            action: "PAYMENT_RECEIVED",
                            entity: "vehicle",
                            entityId: vehicle.id,
                            metadata: {
                                registrationNo: vehicle.registrationNo,
                                ownerName: vehicle.ownerName,
                                amount: vehicle.totalAmount,
                                stripeSessionId: session.id,
                                paymentMethod: "Stripe",
                            },
                        },
                    });
                });

                console.log(`✅ Vehicle ${vehicle.registrationNo} marked as PAID via Stripe`);
                return NextResponse.json({ received: true });
            }

            // CASE 2: INVOICE PAYMENT (Original Logic)
            // Find the invoice with booking and user details
            const invoice = await prisma.invoice.findFirst({
                where: invoiceId ? { id: invoiceId } : { invoiceNo: invoiceNo! },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
                    cargoBooking: { select: { fromLocation: true, toLocation: true, service: true, contactName: true, userId: true } },
                    passengerBooking: { select: { fromLocation: true, toLocation: true, name: true, userId: true } },
                },
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

            // ── Send email notifications ──────────────────────────────
            // ... (Rest of original email logic stays here for invoices)

            const booking = invoice.cargoBooking || invoice.passengerBooking;
            const customerName = invoice.cargoBooking?.contactName
                || invoice.passengerBooking?.name
                || `${invoice.user?.firstName || ''} ${invoice.user?.lastName || ''}`.trim()
                || 'Customer';
            const route = booking
                ? `${booking.fromLocation} → ${booking.toLocation}`
                : 'N/A';
            const bookingType = invoice.cargoBookingId ? 'Cargo' : 'Passenger';

            const emailData = {
                invoiceNo: invoice.invoiceNo,
                customerName,
                amount: invoice.totalAmount,
                route,
                bookingType,
                paymentMethod: 'Stripe (Online)',
            };

            const emailPromises: Promise<any>[] = [];

            // 1. Email the agent/user who created the booking (not all agents)
            const bookingCreatorId = invoice.cargoBooking?.userId
                || invoice.passengerBooking?.userId
                || invoice.userId;

            if (bookingCreatorId) {
                const creator = await prisma.user.findUnique({
                    where: { id: bookingCreatorId },
                    select: { firstName: true, lastName: true, email: true, role: true },
                });

                if (creator && creator.email) {
                    const { subject, html } = getPaymentConfirmationEmail({
                        ...emailData,
                        recipientName: `${creator.firstName} ${creator.lastName}`,
                        isAdmin: creator.role === 'ADMIN',
                    });
                    emailPromises.push(
                        sendEmail({ to: creator.email, subject, html })
                    );
                }
            }

            // 2. Email all ADMINs (skip if the creator is already an admin)
            const admins = await prisma.user.findMany({
                where: {
                    role: 'ADMIN',
                    isActive: true,
                    id: { not: bookingCreatorId }, // Don't double-email if creator is admin
                },
                select: { firstName: true, lastName: true, email: true },
            });

            for (const admin of admins) {
                const { subject, html } = getPaymentConfirmationEmail({
                    ...emailData,
                    recipientName: `${admin.firstName} ${admin.lastName}`,
                    isAdmin: true,
                });
                emailPromises.push(
                    sendEmail({ to: admin.email, subject, html })
                );
            }

            // Fire all emails (don't block webhook response)
            Promise.allSettled(emailPromises).then((results) => {
                const sent = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;
                console.log(`📧 Payment emails: ${sent} sent, ${failed} failed for invoice ${invoice.invoiceNo}`);
            });

        } catch (error) {
            console.error("Failed to update invoice after payment:", error);
        }
    }

    return NextResponse.json({ received: true });
}