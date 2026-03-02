// ============================================
// GET /api/equipment/[id]
// PATCH /api/equipment/[id]
// DELETE /api/equipment/[id]
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

    const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: { 
            location: { select: { id: true, code: true, name: true } },
            assignments: {
                orderBy: { assignedAt: 'desc' },
                take: 10,
                include: {
                    assignedTo: { select: { firstName: true, lastName: true, email: true } },
                    assignedBy: { select: { firstName: true, lastName: true } },
                },
            },
        },
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
        // Check if equipment exists
        const existing = await prisma.equipment.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
        }

        const updateData: any = {};
        
        if (body.name !== undefined) {
            if (!body.name.trim()) {
                return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
            }
            updateData.name = body.name.trim();
        }
        
        if (body.identifier !== undefined) {
            updateData.identifier = body.identifier?.trim() || null;
        }
        
        if (body.type !== undefined) {
            const validTypes = ['FORKLIFT', 'MULE', 'CHASSIS', 'CONTAINER', 'FLAT_RACK'];
            if (!validTypes.includes(body.type)) {
                return NextResponse.json(
                    { error: `Invalid equipment type` },
                    { status: 400 }
                );
            }
            updateData.type = body.type;
        }

        if (body.status !== undefined) {
            const validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
            if (!validStatuses.includes(body.status)) {
                return NextResponse.json(
                    { error: `Invalid status` },
                    { status: 400 }
                );
            }
            updateData.status = body.status;
        }

        if (body.locationCode) {
            const location = await prisma.location.findUnique({
                where: { code: body.locationCode },
            });
            if (!location) {
                return NextResponse.json(
                    { error: `Location '${body.locationCode}' not found` },
                    { status: 404 }
                );
            }
            updateData.locationId = location.id;
        }

        const equipment = await prisma.equipment.update({
            where: { id },
            data: updateData,
            include: { location: { select: { id: true, code: true, name: true } } },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_EQUIPMENT",
            entity: "equipment",
            entityId: id,
            metadata: { 
                name: equipment.name,
                changes: Object.keys(updateData)
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            equipment,
            message: `${equipment.name} updated successfully`
        });
    } catch (error: any) {
        console.error("Update equipment error:", error);
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
        // Check if equipment exists and has active assignments
        const equipment = await prisma.equipment.findUnique({
            where: { id },
            include: {
                assignments: {
                    where: { releasedAt: null },
                },
            },
        });

        if (!equipment) {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
        }

        if (equipment.assignments.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete equipment with active assignments. Please release it first." },
                { status: 400 }
            );
        }

        // Soft delete
        await prisma.equipment.update({
            where: { id },
            data: { isActive: false },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_EQUIPMENT",
            entity: "equipment",
            entityId: id,
            metadata: { name: equipment.name, type: equipment.type },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            message: `${equipment.name} removed successfully` 
        });
    } catch (error: any) {
        console.error("Delete equipment error:", error);
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}