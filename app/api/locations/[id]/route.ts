// ============================================
// GET /api/locations/[id] - Get location details
// PATCH /api/locations/[id] - Update location
// DELETE /api/locations/[id] - Deactivate location
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const location = await prisma.location.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    pricesFrom: true,
                    pricesTo: true,
                    equipmentAt: true,
                    voyagesFrom: true,
                    voyagesTo: true,
                },
            },
        },
    });

    if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ location });
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
        if (body.code) updateData.code = body.code.toUpperCase();
        if (body.name) updateData.name = body.name;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        const location = await prisma.location.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_LOCATION",
            entity: "location",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ location });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Location code already exists" }, { status: 409 });
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
        // Soft delete - deactivate
        await prisma.location.update({
            where: { id },
            data: { isActive: false },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_LOCATION",
            entity: "location",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Location deactivated" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
