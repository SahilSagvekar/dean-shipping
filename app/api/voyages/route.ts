// ============================================
// GET /api/voyages - List voyages with stops and shipments
// POST /api/voyages - Create new voyage (with multi-stop support)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    // const result = await requireAuth(request);
    // if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || undefined;
    const upcoming = searchParams.get("upcoming"); // "true" to get only future voyages
    const skip = (page - 1) * limit;

    try {
        const where: any = {};
        if (status) where.status = status;
        if (upcoming === "true") {
            where.date = { gte: new Date() };
        }

        const voyages = await prisma.voyage.findMany({
            where,
            orderBy: { date: upcoming === "true" ? "asc" : "desc" },
            skip,
            take: limit,
            include: {
                from: { select: { id: true, code: true, name: true } },
                to: { select: { id: true, code: true, name: true } },
                stops: {
                    include: {
                        location: { select: { id: true, code: true, name: true } },
                    },
                    orderBy: { stopOrder: "asc" },
                },
                schedule: {
                    select: { id: true, date: true, shipName: true },
                },
                _count: {
                    select: {
                        cargoBookings: true,
                        passengerBookings: true,
                        manifestItems: true,
                    },
                },
            },
        });

        const total = await prisma.voyage.count({ where });

        return NextResponse.json({
            voyages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Get voyages error:", error?.code || error?.message);
        return NextResponse.json(
            { error: "Failed to fetch voyages" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const voyageNo = body.voyageNo;
        const shipName = body.shipName || body.vesselName;
        const date = body.date || body.departureDate;
        const fromLocationCode = body.fromLocationCode || body.fromCode;
        const toLocationCode = body.toLocationCode || body.toCode;
        const status = body.status;
        const scheduleId = body.scheduleId;
        const stops = body.stops; // Array of { locationCode, stopOrder, arrivalTime, departureTime, activities, notes }

        // Validation
        const errors: string[] = [];
        if (!voyageNo) errors.push("Voyage number is required");
        if (!date) errors.push("Date is required");
        if (!shipName) errors.push("Ship name is required");

        // Either from/to codes OR stops array is required
        if (!stops?.length && !fromLocationCode) errors.push("From location or stops are required");
        if (!stops?.length && !toLocationCode) errors.push("To location or stops are required");

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        // voyageNo must be an integer
        const voyageNoInt = parseInt(String(voyageNo));
        if (isNaN(voyageNoInt)) {
            return NextResponse.json(
                { error: "Voyage number must be a valid integer" },
                { status: 400 }
            );
        }

        // Check for duplicate voyage number
        const existing = await prisma.voyage.findUnique({
            where: { voyageNo: voyageNoInt },
        });

        if (existing) {
            return NextResponse.json(
                { error: `Voyage ${voyageNoInt} already exists` },
                { status: 400 }
            );
        }

        // Resolve from/to locations (first/last stop)
        let fromLocation: any;
        let toLocation: any;

        if (stops?.length >= 2) {
            // Resolve locations from the stops array
            const firstStopCode = stops[0].locationCode;
            const lastStopCode = stops[stops.length - 1].locationCode;

            fromLocation = await prisma.location.findUnique({ where: { code: firstStopCode } });
            toLocation = await prisma.location.findUnique({ where: { code: lastStopCode } });

            if (!fromLocation || !toLocation) {
                return NextResponse.json(
                    { error: "Invalid location codes in stops" },
                    { status: 400 }
                );
            }

            // Validate all stop location codes
            const locationCodes = stops.map((s: any) => s.locationCode);
            const locations = await prisma.location.findMany({
                where: { code: { in: locationCodes } },
            });
            if (locations.length !== new Set(locationCodes).size) {
                return NextResponse.json(
                    { error: "One or more stop location codes are invalid" },
                    { status: 400 }
                );
            }
        } else {
            // Fallback to simple from/to codes
            fromLocation = await prisma.location.findUnique({ where: { code: fromLocationCode } });
            toLocation = await prisma.location.findUnique({ where: { code: toLocationCode } });

            if (!fromLocation || !toLocation) {
                return NextResponse.json(
                    { error: "Invalid location codes" },
                    { status: 400 }
                );
            }
        }

        // Create voyage with stops in a transaction
        const voyage = await prisma.$transaction(async (tx) => {
            const newVoyage = await tx.voyage.create({
                data: {
                    voyageNo: voyageNoInt,
                    shipName,
                    date: new Date(date),
                    fromId: fromLocation.id,
                    toId: toLocation.id,
                    status: status || "SCHEDULED",
                    scheduleId: scheduleId || null,
                },
            });

            // Create VoyageStops
            if (stops?.length) {
                // Resolve all location codes to IDs
                const locationCodes = stops.map((s: any) => s.locationCode);
                const locations = await tx.location.findMany({
                    where: { code: { in: locationCodes } },
                });
                const codeToId: Record<string, string> = {};
                locations.forEach((loc) => { codeToId[loc.code] = loc.id; });

                await tx.voyageStop.createMany({
                    data: stops.map((stop: any, index: number) => ({
                        voyageId: newVoyage.id,
                        locationId: codeToId[stop.locationCode],
                        stopOrder: stop.stopOrder ?? index + 1,
                        arrivalTime: stop.arrivalTime || null,
                        departureTime: stop.departureTime || null,
                        activities: stop.activities || [],
                        notes: stop.notes || null,
                    })),
                });
            } else {
                // Auto-create 2 stops from from/to
                await tx.voyageStop.createMany({
                    data: [
                        {
                            voyageId: newVoyage.id,
                            locationId: fromLocation.id,
                            stopOrder: 1,
                            departureTime: null,
                            activities: ["Freight Drop Off"],
                        },
                        {
                            voyageId: newVoyage.id,
                            locationId: toLocation.id,
                            stopOrder: 2,
                            arrivalTime: null,
                            activities: ["Freight Pick Up"],
                        },
                    ],
                });
            }

            return newVoyage;
        });

        // Fetch the complete voyage with stops
        const completeVoyage = await prisma.voyage.findUnique({
            where: { id: voyage.id },
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
                stops: {
                    include: {
                        location: { select: { code: true, name: true } },
                    },
                    orderBy: { stopOrder: "asc" },
                },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_VOYAGE",
            entity: "voyage",
            entityId: voyage.id,
            metadata: {
                voyageNo: voyageNoInt,
                shipName,
                stopsCount: stops?.length || 2,
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json(
            {
                voyage: completeVoyage,
                message: `Voyage ${voyageNoInt} created successfully with ${stops?.length || 2} stops`,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create voyage error:", error?.code || error?.message);
        return NextResponse.json(
            { error: "Failed to create voyage" },
            { status: 500 }
        );
    }
}