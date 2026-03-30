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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (shipName) where.shipName = shipName;
    if (month) where.month = month;

    // Date range filter
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate + "T23:59:59.999Z");
    }

    // Only show published schedules for public access
    if (published === "true") {
        where.isPublished = true;

        // Also check for scheduled launches that should now be published
        // This is a simple check - in production you'd use a cron job
        const now = new Date();
        await prisma.schedule.updateMany({
            where: {
                isPublished: false,
                isLaunched: false,
                launchAt: { lte: now }
            },
            data: {
                isPublished: true,
                isLaunched: true
            }
        });
    }

    const [schedules, total] = await Promise.all([
        prisma.schedule.findMany({
            where,
            include: {
                events: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        stops: {
                            orderBy: { stopOrder: "asc" },
                        },
                    },
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

        // Check for existing schedule on same date and ship
        const existing = await prisma.schedule.findFirst({
            where: {
                date: new Date(date),
                shipName
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Schedule already exists for this date and ship" },
                { status: 409 }
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
                isPublished: false,
                isLaunched: false,
                events: {
                    create: (events || []).map((event: any, index: number) => ({
                        // New structure: fromLocation/toLocation
                        fromLocation: event.fromLocation || event.location || "",
                        toLocation: event.toLocation || event.location || "",
                        departureTime: event.departureTime || event.startTime,
                        arrivalTime: event.arrivalTime || event.endTime,
                        // Legacy fields (for backward compatibility)
                        location: event.location,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        // Common fields
                        type: event.type,
                        notes: event.notes,
                        sortOrder: index,
                        // Intermediate stops
                        stops: event.stops?.length > 0 ? {
                            create: event.stops.map((stop: any, stopIndex: number) => ({
                                location: stop.location,
                                arrivalTime: stop.arrivalTime,
                                departureTime: stop.departureTime,
                                activities: stop.activities || [],
                                notes: stop.notes,
                                stopOrder: stopIndex,
                            })),
                        } : undefined,
                    })),
                },
            },
            include: { 
                events: {
                    include: {
                        stops: {
                            orderBy: { stopOrder: "asc" },
                        },
                    },
                },
            },
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