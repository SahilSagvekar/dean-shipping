// ============================================
// POST /api/notifications/send-reminders - Send payment reminders
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getInvoiceEmailTemplate } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { frequency } = body;

        // Get all unpaid invoices with full details for email
        const unpaidInvoices = await prisma.invoice.findMany({
            where: { paymentStatus: 'UNPAID' },
            include: {
                user: true,
                cargoBooking: {
                    include: {
                        items: true,
                    },
                },
                passengerBooking: true,
            },
        });

        if (unpaidInvoices.length === 0) {
            return NextResponse.json({
                message: "No unpaid invoices found",
                sentCount: 0,
            });
        }

        // Group invoices by user
        const userInvoices = unpaidInvoices.reduce((acc: any, invoice) => {
            if (invoice.user) {
                const userId = invoice.user.id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user: invoice.user,
                        invoices: [],
                        totalAmount: 0,
                    };
                }
                acc[userId].invoices.push(invoice);
                acc[userId].totalAmount += invoice.totalAmount;
            }
            return acc;
        }, {});

        // Create notifications and send emails
        const sentList = [];
        for (const userId in userInvoices) {
            const { user, invoices, totalAmount } = userInvoices[userId];

            // 1. Create In-App Notification
            await prisma.notification.create({
                data: {
                    userId,
                    title: "Payment Reminder",
                    message: `You have ${invoices.length} unpaid invoice(s) totaling $${totalAmount.toFixed(2)}. Please complete your payment at your earliest convenience.`,
                    type: "payment_reminder",
                },
            });

            // 2. Send Emails (one for each invoice for clarity)
            for (const invoice of invoices) {
                const bookingType = invoice.cargoBooking ? 'Cargo Booking' : 'Passenger Booking';
                const fromLocation = invoice.cargoBooking?.fromLocation || invoice.passengerBooking?.fromLocation || 'N/A';
                const toLocation = invoice.cargoBooking?.toLocation || invoice.passengerBooking?.toLocation || 'N/A';
                
                let invoiceItems = [];
                if (invoice.cargoBooking?.items) {
                    invoiceItems = invoice.cargoBooking.items.map((item: any) => ({
                        description: item.itemType,
                        quantity: item.quantity,
                        total: item.total
                    }));
                } else if (invoice.passengerBooking) {
                    const pb = invoice.passengerBooking;
                    if (pb.adultCount > 0) invoiceItems.push({ description: 'Adult Passenger', quantity: pb.adultCount, total: pb.adultCount * 65 });
                    if (pb.childCount > 0) invoiceItems.push({ description: 'Child Passenger', quantity: pb.childCount, total: pb.childCount * 45 });
                    if (pb.infantCount > 0) invoiceItems.push({ description: 'Infant Passenger', quantity: pb.infantCount, total: 0 });
                }

                const emailData = {
                    invoiceNo: invoice.invoiceNo,
                    customerName: `${user.firstName} ${user.lastName}`,
                    totalAmount: invoice.totalAmount,
                    subtotal: invoice.subtotal,
                    vatAmount: invoice.vatAmount,
                    items: invoiceItems,
                    fromLocation,
                    toLocation,
                    bookingType
                };

                const { subject, html } = getInvoiceEmailTemplate(emailData, true);
                
                // We don't await each individual email to speed up the loop, 
                // but we push them to a list to track or wait later
                sentList.push(sendEmail({
                    to: user.email,
                    subject,
                    html
                }));
            }
        }

        // Wait for all emails to be processed (though sendEmail itself handles errors)
        await Promise.allSettled(sentList);

        // Log the action
        await createAuditLog({
            userId: result.user.id,
            action: "SEND_PAYMENT_REMINDERS",
            entity: "notification",
            entityId: "bulk",
            metadata: {
                frequency,
                sentCount: Object.keys(userInvoices).length,
                totalInvoices: unpaidInvoices.length,
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            message: `Payment reminders sent to ${Object.keys(userInvoices).length} customers`,
            sentCount: Object.keys(userInvoices).length,
            totalInvoices: unpaidInvoices.length,
        });
    } catch (error: any) {
        console.error("Send reminders error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send reminders" },
            { status: 500 }
        );
    }
}