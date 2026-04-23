import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";
import { VehicleStatus } from "@prisma/client";

export async function PATCH(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { ids, status } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No vehicle IDs provided" }, { status: 400 });
        }

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        const validStatuses = Object.values(VehicleStatus);
        if (!validStatuses.includes(status as VehicleStatus)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // Update all vehicles in the list
        const updatedCount = await prisma.vehicle.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                status: status as VehicleStatus
            }
        });

        await createAuditLog({
            userId: result.user.id,
            action: "BULK_UPDATE_VEHICLE_STATUS",
            entity: "vehicle",
            entityId: "multiple",
            metadata: { 
                count: updatedCount.count,
                ids,
                newStatus: status
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            success: true,
            count: updatedCount.count,
            message: `Successfully updated ${updatedCount.count} vehicles to ${status}`
        });
    } catch (error: any) {
        console.error("Bulk update vehicle error:", error);
        return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
    }
}
