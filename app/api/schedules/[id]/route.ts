// ============================================
// GET /api/schedules/[id] - Get schedule details
// PATCH /api/schedules/[id] - Update schedule
// DELETE /api/schedules/[id] - Delete schedule
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: { events: { orderBy: { sortOrder: "asc" } } },
    });

    if (!schedule) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
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
        const { events, ...scheduleData } = body;

        // Update schedule fields
        const updateData: any = {};
        const allowedFields = ["date", "weekday", "month", "shipName", "isHoliday", "launchAt", "isLaunched", "isPublished"];
        for (const field of allowedFields) {
            if (scheduleData[field] !== undefined) {
                updateData[field] = field === "date" || field === "launchAt"
                    ? new Date(scheduleData[field])
                    : scheduleData[field];
            }
        }

        // If events are provided, replace them
        if (events) {
            await prisma.scheduleEvent.deleteMany({ where: { scheduleId: id } });
            updateData.events = {
                create: events.map((event: any, index: number) => ({
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    type: event.type,
                    notes: event.notes,
                    sortOrder: index,
                })),
            };
        }

        const schedule = await prisma.schedule.update({
            where: { id },
            data: updateData,
            include: { events: { orderBy: { sortOrder: "asc" } } },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_SCHEDULE",
            entity: "schedule",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ schedule });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
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
        await prisma.schedule.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_SCHEDULE",
            entity: "schedule",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Schedule deleted" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
