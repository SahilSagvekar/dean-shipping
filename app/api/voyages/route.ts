// ============================================
// GET /api/voyages - List voyages
// POST /api/voyages - Create a voyage
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const shipName = searchParams.get("ship") || undefined;
    const status = searchParams.get("status") || undefined;
    const fromCode = searchParams.get("from") || undefined;
    const toCode = searchParams.get("to") || undefined;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (shipName) where.shipName = shipName;
    if (status) where.status = status;
    if (fromCode) where.from = { code: fromCode };
    if (toCode) where.to = { code: toCode };
    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [voyages, total] = await Promise.all([
        prisma.voyage.findMany({
            where,
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
                schedule: { select: { id: true, isPublished: true } },
                _count: {
                    select: {
                        cargoBookings: true,
                        passengerBookings: true,
                        manifestItems: true,
                    },
                },
            },
            orderBy: { date: "desc" },
            skip,
            take: limit,
        }),
        prisma.voyage.count({ where }),
    ]);

    return NextResponse.json({
        voyages,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const {
            voyageNo,
            shipName,
            date,
            fromCode,
            toCode,
            maxCargoCapacity,
            maxPassengers,
            scheduleId,
            notes,
        } = body;

        if (!voyageNo || !shipName || !date || !fromCode || !toCode) {
            return NextResponse.json(
                { error: "Missing required fields: voyageNo, shipName, date, fromCode, toCode" },
                { status: 400 }
            );
        }

        // Get or create locations
        const [fromLocation, toLocation] = await Promise.all([
            prisma.location.upsert({
                where: { code: fromCode },
                create: { code: fromCode, name: fromCode },
                update: {},
            }),
            prisma.location.upsert({
                where: { code: toCode },
                create: { code: toCode, name: toCode },
                update: {},
            }),
        ]);

        const voyage = await prisma.voyage.create({
            data: {
                voyageNo: parseInt(voyageNo),
                shipName,
                date: new Date(date),
                fromId: fromLocation.id,
                toId: toLocation.id,
                maxCargoCapacity: maxCargoCapacity ? parseInt(maxCargoCapacity) : undefined,
                maxPassengers: maxPassengers ? parseInt(maxPassengers) : undefined,
                scheduleId,
                notes,
            },
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_VOYAGE",
            entity: "voyage",
            entityId: voyage.id,
            metadata: { voyageNo, shipName, from: fromCode, to: toCode },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ voyage }, { status: 201 });
    } catch (error: any) {
        console.error("Create voyage error:", error);
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Voyage number already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: "Failed to create voyage" }, { status: 500 });
    }
}
