// ============================================
// PATCH /api/vehicles/[id] - Update vehicle status
// DELETE /api/vehicles/[id] - Remove from wait list
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

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
        const fields = ["registrationNo", "ownerName", "contactNo", "vehicleType", "fromLocation", "toLocation", "status", "notes"];
        for (const field of fields) {
            if (body[field] !== undefined) updateData[field] = body[field];
        }

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_VEHICLE",
            entity: "vehicle",
            entityId: id,
            metadata: { status: body.status },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ vehicle });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
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
        await prisma.vehicle.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_VEHICLE",
            entity: "vehicle",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Vehicle removed from wait list" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
