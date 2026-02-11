// ============================================
// GET /api/invoices/[id]
// PATCH /api/invoices/[id] - Update payment status
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            user: {
                select: { firstName: true, lastName: true, email: true, mobileNumber: true },
            },
            cargoBooking: {
                include: { items: true, images: true },
            },
            passengerBooking: {
                include: { images: true },
            },
        },
    });

    if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (result.user.role === "USER" && invoice.userId !== result.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ invoice });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();

    try {
        const updateData: any = {};
        if (body.paymentStatus) {
            updateData.paymentStatus = body.paymentStatus;
            if (body.paymentStatus === "PAID") {
                updateData.paidAt = new Date();
            }
        }
        if (body.paymentMode) updateData.paymentMode = body.paymentMode;

        const invoice = await prisma.invoice.update({
            where: { id },
            data: updateData,
        });

        // Sync payment status to the linked booking
        if (body.paymentStatus) {
            if (invoice.cargoBookingId) {
                await prisma.cargoBooking.update({
                    where: { id: invoice.cargoBookingId },
                    data: { paymentStatus: body.paymentStatus },
                });
            }
            if (invoice.passengerBookingId) {
                await prisma.passengerBooking.update({
                    where: { id: invoice.passengerBookingId },
                    data: { paymentStatus: body.paymentStatus },
                });
            }
        }

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_INVOICE",
            entity: "invoice",
            entityId: id,
            metadata: { paymentStatus: body.paymentStatus, paymentMode: body.paymentMode },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ invoice });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
