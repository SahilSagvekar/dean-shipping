// ============================================
// POST /api/schedules/[id]/launch - Launch a schedule
// POST /api/schedules/[id]/publish - Publish a schedule
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const url = new URL(request.url);
    const action = url.pathname.split("/").pop(); // "launch" or "publish"

    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: { events: true },
        });

        if (!schedule) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }

        let updateData: any = {};
        let auditAction = "";

        if (action === "launch") {
            if (schedule.isLaunched) {
                return NextResponse.json(
                    { error: "Schedule already launched" },
                    { status: 400 }
                );
            }
            updateData = {
                isLaunched: true,
                launchAt: new Date(),
            };
            auditAction = "LAUNCH_SCHEDULE";
        } else if (action === "publish") {
            if (!schedule.isLaunched) {
                return NextResponse.json(
                    { error: "Schedule must be launched before publishing" },
                    { status: 400 }
                );
            }
            if (schedule.isPublished) {
                return NextResponse.json(
                    { error: "Schedule already published" },
                    { status: 400 }
                );
            }
            updateData = {
                isPublished: true,
            };
            auditAction = "PUBLISH_SCHEDULE";
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const updatedSchedule = await prisma.schedule.update({
            where: { id },
            data: updateData,
            include: { events: { orderBy: { sortOrder: "asc" } } },
        });

        await createAuditLog({
            userId: result.user.id,
            action: auditAction,
            entity: "schedule",
            entityId: id,
            metadata: { shipName: schedule.shipName, date: schedule.date },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            message: `Schedule ${action}ed successfully`,
            schedule: updatedSchedule,
        });
    } catch (error: any) {
        console.error(`Schedule ${action} error:`, error);
        return NextResponse.json({ error: `Failed to ${action} schedule` }, { status: 500 });
    }
}
