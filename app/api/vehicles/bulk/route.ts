import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";
import { VehicleStatus, PaymentStatus } from "@prisma/client";

export async function PATCH(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { ids, status } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No vehicle IDs provided" }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status as VehicleStatus;
        if (body.paymentStatus) {
            updateData.paymentStatus = body.paymentStatus as PaymentStatus;
            if (body.paymentStatus === 'PAID') {
                updateData.paidAt = new Date();
            }
        }

        // Update all vehicles in the list
        const updatedCount = await prisma.vehicle.updateMany({
            where: {
                id: { in: ids }
            },
            data: updateData
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
