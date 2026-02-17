// ============================================
// GET /api/vehicles/[id]
// PATCH /api/vehicles/[id] - Update vehicle
// DELETE /api/vehicles/[id] - Remove from wait list
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";
import { VehicleStatus } from "@prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
    });

    if (!vehicle) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
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
        // Check if vehicle exists
        const existing = await prisma.vehicle.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        const updateData: any = {};
        
        // Handle string fields
        const stringFields = [
            "registrationNo", 
            "ownerName", 
            "ownerEmail",
            "contactNo", 
            "vehicleType", 
            "fromLocation", 
            "toLocation", 
            "notes"
        ];

        for (const field of stringFields) {
            if (body[field] !== undefined) {
                if (field === 'registrationNo' && body[field]) {
                    updateData[field] = body[field].trim().toUpperCase();
                } else if (typeof body[field] === 'string') {
                    updateData[field] = body[field].trim() || null;
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        // Handle status enum separately
        if (body.status !== undefined) {
            const validStatuses = Object.values(VehicleStatus);
            if (!validStatuses.includes(body.status as VehicleStatus)) {
                return NextResponse.json(
                    { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                    { status: 400 }
                );
            }
            updateData.status = body.status as VehicleStatus;
        }

        // Validate locations if being updated
        const newFrom = body.fromLocation || existing.fromLocation;
        const newTo = body.toLocation || existing.toLocation;
        if (newFrom === newTo) {
            return NextResponse.json(
                { error: "From and To locations cannot be the same" },
                { status: 400 }
            );
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
            metadata: { 
                registrationNo: vehicle.registrationNo,
                status: body.status,
                changes: Object.keys(updateData)
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            vehicle,
            message: `Vehicle ${vehicle.registrationNo} updated`
        });
    } catch (error: any) {
        console.error("Update vehicle error:", error);
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
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
        });

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        // Check if vehicle is in transit
        if (vehicle.status === VehicleStatus.IN_TRANSIT) {
            return NextResponse.json(
                { error: "Cannot delete a vehicle that is currently in transit" },
                { status: 400 }
            );
        }

        await prisma.vehicle.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_VEHICLE",
            entity: "vehicle",
            entityId: id,
            metadata: { 
                registrationNo: vehicle.registrationNo,
                ownerName: vehicle.ownerName 
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            message: `Vehicle ${vehicle.registrationNo} removed from waitlist` 
        });
    } catch (error: any) {
        console.error("Delete vehicle error:", error);
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}