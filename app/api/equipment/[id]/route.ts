// ============================================
// GET /api/equipment/[id]
// PATCH /api/equipment/[id]
// DELETE /api/equipment/[id]
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: { location: { select: { code: true, name: true } } },
    });

    if (!equipment) {
        return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    }

    return NextResponse.json({ equipment });
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
        if (body.name) updateData.name = body.name;
        if (body.identifier) updateData.identifier = body.identifier;
        if (body.type) updateData.type = body.type;

        if (body.locationCode) {
            const location = await prisma.location.upsert({
                where: { code: body.locationCode },
                create: { code: body.locationCode, name: body.locationCode },
                update: {},
            });
            updateData.locationId = location.id;
        }

        const equipment = await prisma.equipment.update({
            where: { id },
            data: updateData,
            include: { location: { select: { code: true, name: true } } },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_EQUIPMENT",
            entity: "equipment",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ equipment });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
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
        await prisma.equipment.update({
            where: { id },
            data: { isActive: false },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_EQUIPMENT",
            entity: "equipment",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Equipment removed" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
