// ============================================
// POST /api/notifications/send-reminders - Send payment reminders
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { frequency } = body;

        // Get all unpaid invoices with user details
        const unpaidInvoices = await prisma.invoice.findMany({
            where: { paymentStatus: 'UNPAID' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                cargoBooking: {
                    select: {
                        service: true,
                        fromLocation: { select: { code: true, name: true } },
                        toLocation: { select: { code: true, name: true } },
                    },
                },
                passengerBooking: {
                    select: {
                        fromLocation: { select: { code: true, name: true } },
                        toLocation: { select: { code: true, name: true } },
                    },
                },
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
                acc[userId].totalAmount += invoice.grandTotal;
            }
            return acc;
        }, {});

        // Create notifications for each user
        const notifications = [];
        for (const userId in userInvoices) {
            const { user, invoices, totalAmount } = userInvoices[userId];
            
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    title: "Payment Reminder",
                    message: `You have ${invoices.length} unpaid invoice(s) totaling $${totalAmount.toFixed(2)}. Please complete your payment at your earliest convenience.`,
                    type: "payment_reminder",
                },
            });
            
            notifications.push(notification);
        }

        // Log the action
        await createAuditLog({
            userId: result.user.id,
            action: "SEND_PAYMENT_REMINDERS",
            entity: "notification",
            entityId: "bulk",
            metadata: {
                frequency,
                sentCount: notifications.length,
                totalInvoices: unpaidInvoices.length,
            },
            ipAddress: getClientIp(request),
        });

        // In a real application, you would also send emails here
        // await sendPaymentReminderEmails(userInvoices);

        return NextResponse.json({
            message: `Payment reminders sent to ${notifications.length} customers`,
            sentCount: notifications.length,
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