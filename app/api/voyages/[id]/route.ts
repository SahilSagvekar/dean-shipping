// ============================================
// GET /api/voyages/[id] - Get voyage details
// PATCH /api/voyages/[id] - Update voyage
// DELETE /api/voyages/[id] - Delete voyage
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

    const voyage = await prisma.voyage.findUnique({
        where: { id },
        include: {
            from: { select: { id: true, code: true, name: true } },
            to: { select: { id: true, code: true, name: true } },
            stops: {
                include: {
                    location: { select: { id: true, code: true, name: true } },
                },
                orderBy: { stopOrder: "asc" },
            },
            schedule: true,
            cargoBookings: {
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    items: true,
                    invoice: {
                        select: { invoiceNo: true, totalAmount: true, paymentStatus: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            passengerBookings: {
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    invoice: {
                        select: { invoiceNo: true, totalAmount: true, paymentStatus: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            manifestItems: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!voyage) {
        return NextResponse.json({ error: "Voyage not found" }, { status: 404 });
    }

    return NextResponse.json({ voyage });
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
        const allowedFields = [
            "shipName", "date", "status", "maxCargoCapacity",
            "maxPassengers", "currentCargoCount", "currentPassengers", "notes"
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === "date") {
                    updateData[field] = new Date(body[field]);
                } else if (["maxCargoCapacity", "maxPassengers", "currentCargoCount", "currentPassengers"].includes(field)) {
                    updateData[field] = parseInt(body[field]);
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        // Handle location updates
        if (body.fromCode) {
            const from = await prisma.location.upsert({
                where: { code: body.fromCode },
                create: { code: body.fromCode, name: body.fromCode },
                update: {},
            });
            updateData.fromId = from.id;
        }
        if (body.toCode) {
            const to = await prisma.location.upsert({
                where: { code: body.toCode },
                create: { code: body.toCode, name: body.toCode },
                update: {},
            });
            updateData.toId = to.id;
        }

        const voyage = await prisma.voyage.update({
            where: { id },
            data: updateData,
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_VOYAGE",
            entity: "voyage",
            entityId: id,
            metadata: { updatedFields: Object.keys(updateData) },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ voyage });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Voyage not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    try {
        // Check if voyage has bookings
        const voyage = await prisma.voyage.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { cargoBookings: true, passengerBookings: true },
                },
            },
        });

        if (!voyage) {
            return NextResponse.json({ error: "Voyage not found" }, { status: 404 });
        }

        if (voyage._count.cargoBookings > 0 || voyage._count.passengerBookings > 0) {
            return NextResponse.json(
                { error: "Cannot delete voyage with existing bookings" },
                { status: 400 }
            );
        }

        await prisma.voyage.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_VOYAGE",
            entity: "voyage",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Voyage deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
