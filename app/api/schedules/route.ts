// ============================================
// GET /api/schedules - List schedules
// POST /api/schedules - Create a schedule entry
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    // Public route - anyone can view published schedules
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const shipName = searchParams.get("ship") || undefined;
    const month = searchParams.get("month") || undefined;
    const published = searchParams.get("published");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (shipName) where.shipName = shipName;
    if (month) where.month = month;
    // Only show published schedules for non-staff
    if (published === "true") where.isPublished = true;

    const [schedules, total] = await Promise.all([
        prisma.schedule.findMany({
            where,
            include: {
                events: {
                    orderBy: { sortOrder: "asc" },
                },
            },
            orderBy: { date: "asc" },
            skip,
            take: limit,
        }),
        prisma.schedule.count({ where }),
    ]);

    return NextResponse.json({
        schedules,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { date, weekday, month, shipName, isHoliday, events, launchAt } = body;

        if (!date || !weekday || !month || !shipName) {
            return NextResponse.json(
                { error: "Missing required fields: date, weekday, month, shipName" },
                { status: 400 }
            );
        }

        const schedule = await prisma.schedule.create({
            data: {
                date: new Date(date),
                weekday,
                month,
                shipName,
                isHoliday: isHoliday || false,
                launchAt: launchAt ? new Date(launchAt) : undefined,
                events: {
                    create: (events || []).map((event: any, index: number) => ({
                        location: event.location,
                        time: event.time,
                        type: event.type,
                        notes: event.notes,
                        sortOrder: index,
                    })),
                },
            },
            include: { events: true },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_SCHEDULE",
            entity: "schedule",
            entityId: schedule.id,
            metadata: { shipName, date },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ schedule }, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Schedule already exists for this date and ship" },
                { status: 409 }
            );
        }
        console.error("Create schedule error:", error);
        return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }
}
