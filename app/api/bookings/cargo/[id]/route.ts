// ============================================
// GET /api/bookings/cargo/[id] - Get booking details
// PATCH /api/bookings/cargo/[id] - Update booking
// DELETE /api/bookings/cargo/[id] - Delete booking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    const booking = await prisma.cargoBooking.findUnique({
        where: { id },
        include: {
            user: {
                select: { firstName: true, lastName: true, email: true, mobileNumber: true },
            },
            items: true,
            images: true,
            invoice: true,
        },
    });

    if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Users can only view their own bookings
    if (result.user.role === "USER" && booking.userId !== result.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();

    try {
        // Check ownership
        const existing = await prisma.cargoBooking.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        if (result.user.role === "USER" && existing.userId !== result.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const allowedFields = [
            "paymentStatus", "remark", "damageFound", "damageLocation",
            "deficiencyComment", "contactName", "contactEmail", "contactPhone",
            "address", "totalAmount",
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updateData[field] = body[field];
        }

        const booking = await prisma.cargoBooking.update({
            where: { id },
            data: updateData,
            include: { items: true },
        });

        // Sync invoice payment status
        if (body.paymentStatus) {
            await prisma.invoice.updateMany({
                where: { cargoBookingId: id },
                data: {
                    paymentStatus: body.paymentStatus,
                    paidAt: body.paymentStatus === "PAID" ? new Date() : null,
                    paymentMode: body.paymentMode || undefined,
                },
            });
        }

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_CARGO_BOOKING",
            entity: "cargo_booking",
            entityId: id,
            metadata: { updatedFields: Object.keys(updateData) },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ booking });
    } catch (error: any) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    if (result.user.role === "USER") {
        return NextResponse.json({ error: "Only staff can delete bookings" }, { status: 403 });
    }

    try {
        await prisma.cargoBooking.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_CARGO_BOOKING",
            entity: "cargo_booking",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Booking deleted" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
