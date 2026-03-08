// ============================================
// POST /api/schedules/create-voyages
// ============================================
// When schedules are published, this endpoint
// auto-creates Voyages with VoyageStops from the schedule events.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { scheduleIds } = body; // Array of schedule IDs to create voyages for

        if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
            return NextResponse.json(
                { error: "scheduleIds array is required" },
                { status: 400 }
            );
        }

        // Fetch all the schedules with their events
        const schedules = await prisma.schedule.findMany({
            where: {
                id: { in: scheduleIds },
            },
            include: {
                events: { orderBy: { sortOrder: "asc" } },
                voyages: true, // Check if voyage already exists
            },
        });

        if (schedules.length === 0) {
            return NextResponse.json(
                { error: "No schedules found" },
                { status: 404 }
            );
        }

        // Get the current max voyage number to auto-increment
        const maxVoyage = await prisma.voyage.findFirst({
            orderBy: { voyageNo: "desc" },
            select: { voyageNo: true },
        });
        let nextVoyageNo = (maxVoyage?.voyageNo || 200) + 1;

        // Fetch all locations for name → code mapping
        const allLocations = await prisma.location.findMany();
        const locationByName: Record<string, typeof allLocations[0]> = {};
        const locationByCode: Record<string, typeof allLocations[0]> = {};
        allLocations.forEach((loc) => {
            locationByName[loc.name.toLowerCase()] = loc;
            locationByCode[loc.code.toLowerCase()] = loc;
        });

        // Helper to resolve a location string (could be a name like "Nassau" or a code like "NAS")
        const resolveLocation = (str: string) => {
            const lower = str.toLowerCase().trim();
            return locationByName[lower] || locationByCode[lower] || null;
        };

        const createdVoyages: any[] = [];
        const skippedSchedules: string[] = [];

        for (const schedule of schedules) {
            // Skip if schedule already has a voyage
            if (schedule.voyages.length > 0) {
                skippedSchedules.push(schedule.id);
                continue;
            }

            // Skip holiday schedules
            if (schedule.isHoliday) {
                skippedSchedules.push(schedule.id);
                continue;
            }

            // Skip schedules with no events (no stops to create)
            if (schedule.events.length === 0) {
                skippedSchedules.push(schedule.id);
                continue;
            }

            // Resolve and merge locations from schedule events
            const stopsMap = new Map<string, {
                location: typeof allLocations[0],
                events: typeof schedule.events
            }>();

            for (const event of schedule.events) {
                const location = resolveLocation(event.location);
                if (!location) {
                    console.warn(`Could not resolve location "${event.location}" for schedule ${schedule.id}`);
                    continue;
                }

                if (!stopsMap.has(location.id)) {
                    stopsMap.set(location.id, { location, events: [] });
                }
                stopsMap.get(location.id)!.events.push(event);
            }

            const resolvedStops = Array.from(stopsMap.values()).map((stop, index) => ({
                location: stop.location,
                events: stop.events,
                stopOrder: index + 1,
            }));

            if (resolvedStops.length < 2) {
                // Need at least 2 stops for a voyage
                skippedSchedules.push(schedule.id);
                continue;
            }

            const firstStop = resolvedStops[0];
            const lastStop = resolvedStops[resolvedStops.length - 1];
            const voyageNo = nextVoyageNo++;

            // Create the voyage with stops in a transaction
            const voyage = await prisma.$transaction(async (tx) => {
                const newVoyage = await tx.voyage.create({
                    data: {
                        voyageNo,
                        shipName: schedule.shipName,
                        date: schedule.date,
                        fromId: firstStop.location.id,
                        toId: lastStop.location.id,
                        status: "SCHEDULED",
                        scheduleId: schedule.id,
                    },
                });

                // Create VoyageStops
                await tx.voyageStop.createMany({
                    data: resolvedStops.map((stop, index) => {
                        const isFirst = index === 0;
                        const isLast = index === resolvedStops.length - 1;

                        // Merge activities and notes from all events at this location
                        const activities = Array.from(new Set(stop.events.map(e => e.type)));
                        const notes = stop.events.map(e => e.notes).filter(Boolean).join("; ");

                        // Use startTime of first event and endTime of last event at this location
                        const arrivalTime = isFirst ? null : stop.events[0].startTime || null;
                        const departureTime = isLast ? null : stop.events[stop.events.length - 1].endTime || null;

                        return {
                            voyageId: newVoyage.id,
                            locationId: stop.location.id,
                            stopOrder: stop.stopOrder,
                            departureTime,
                            arrivalTime,
                            activities,
                            notes: notes || null,
                        };
                    }),
                });

                return newVoyage;
            });

            // Fetch the complete voyage
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

            createdVoyages.push(completeVoyage);

            await createAuditLog({
                userId: result.user.id,
                action: "AUTO_CREATE_VOYAGE",
                entity: "voyage",
                entityId: voyage.id,
                metadata: {
                    voyageNo,
                    scheduleId: schedule.id,
                    stopsCount: resolvedStops.length,
                    shipName: schedule.shipName,
                },
                ipAddress: getClientIp(request),
            });
        }

        return NextResponse.json({
            message: `Created ${createdVoyages.length} voyage(s), skipped ${skippedSchedules.length} schedule(s)`,
            voyages: createdVoyages,
            skippedScheduleIds: skippedSchedules,
        });
    } catch (error: any) {
        console.error("Create voyages from schedules error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create voyages" },
            { status: 500 }
        );
    }
}
