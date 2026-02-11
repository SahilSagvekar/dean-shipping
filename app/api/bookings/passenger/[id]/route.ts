// ============================================
// GET /api/bookings/passenger/[id]
// PATCH /api/bookings/passenger/[id]
// DELETE /api/bookings/passenger/[id]
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

    const booking = await prisma.passengerBooking.findUnique({
        where: { id },
        include: {
            user: {
                select: { firstName: true, lastName: true, email: true, mobileNumber: true },
            },
            images: true,
            invoice: true,
        },
    });

    if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

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
        const existing = await prisma.passengerBooking.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        if (result.user.role === "USER" && existing.userId !== result.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const allowedFields = [
            "infantCount", "childCount", "adultCount",
            "name", "email", "contact", "paymentStatus",
            "remark", "totalAmount",
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updateData[field] = body[field];
        }

        const booking = await prisma.passengerBooking.update({
            where: { id },
            data: updateData,
        });

        // Sync invoice
        if (body.paymentStatus) {
            await prisma.invoice.updateMany({
                where: { passengerBookingId: id },
                data: {
                    paymentStatus: body.paymentStatus,
                    paidAt: body.paymentStatus === "PAID" ? new Date() : null,
                    paymentMode: body.paymentMode || undefined,
                },
            });
        }

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_PASSENGER_BOOKING",
            entity: "passenger_booking",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ booking });
    } catch {
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
        await prisma.passengerBooking.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_PASSENGER_BOOKING",
            entity: "passenger_booking",
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
