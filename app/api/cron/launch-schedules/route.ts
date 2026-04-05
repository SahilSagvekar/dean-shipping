// ============================================
// GET /api/cron/launch-schedules
// ============================================
// Vercel Cron job that runs every 15 minutes to:
// 1. Find schedules with launchAt <= now that aren't published yet
// 2. Publish them (set isPublished = true, isLaunched = true)
// 3. Auto-create voyages from those schedules
//
// Vercel Cron: Configure in vercel.json with schedule "*/15 * * * *"

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Verify the request is from Vercel Cron (in production)
function verifyCronRequest(request: NextRequest): boolean {
    // In development, allow all requests
    if (process.env.NODE_ENV === "development") {
        return true;
    }

    // In production, verify the Authorization header matches CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.warn("CRON_SECRET not set - cron job disabled in production");
        return false;
    }

    return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
    // Verify this is a legitimate cron request
    if (!verifyCronRequest(request)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const now = new Date();
        console.log(`[Cron] Running launch-schedules at ${now.toISOString()}`);

        // Find schedules that should be launched
        const schedulesToLaunch = await prisma.schedule.findMany({
            where: {
                isPublished: false,
                isLaunched: false,
                launchAt: { lte: now },
            },
            include: {
                events: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        stops: { orderBy: { stopOrder: "asc" } },
                    },
                },
            },
        });

        if (schedulesToLaunch.length === 0) {
            console.log("[Cron] No schedules to launch");
            return NextResponse.json({
                message: "No schedules to launch",
                launched: 0,
                voyagesCreated: 0,
            });
        }

        console.log(`[Cron] Found ${schedulesToLaunch.length} schedule(s) to launch`);

        // Publish all the schedules
        const scheduleIds = schedulesToLaunch.map(s => s.id);
        await prisma.schedule.updateMany({
            where: { id: { in: scheduleIds } },
            data: {
                isPublished: true,
                isLaunched: true,
            },
        });

        console.log(`[Cron] Published ${scheduleIds.length} schedule(s)`);

        // Now create voyages from these schedules
        // Reusing the same logic from create-voyages endpoint

        const allLocations = await prisma.location.findMany();
        const locationByName: Record<string, typeof allLocations[0]> = {};
        const locationByCode: Record<string, typeof allLocations[0]> = {};
        allLocations.forEach((loc) => {
            locationByName[loc.name.toLowerCase()] = loc;
            locationByCode[loc.code.toLowerCase()] = loc;
        });

        const resolveLocation = (str: string | null | undefined) => {
            if (!str) return null;
            const lower = str.toLowerCase().trim();
            return locationByName[lower] || locationByCode[lower] || null;
        };

        // Get current max voyage number
        const maxVoyage = await prisma.voyage.findFirst({
            orderBy: { voyageNo: "desc" },
            select: { voyageNo: true },
        });
        let nextVoyageNo = (maxVoyage?.voyageNo || 200) + 1;

        const createdVoyages: string[] = [];
        const errors: string[] = [];

        for (const schedule of schedulesToLaunch) {
            try {
                // Skip holidays
                if (schedule.isHoliday) continue;

                // Skip schedules with no events
                if (schedule.events.length === 0) continue;

                // Check if voyage already exists for this schedule
                const existingVoyage = await prisma.voyage.findFirst({
                    where: { scheduleId: schedule.id },
                });
                if (existingVoyage) {
                    console.log(`[Cron] Voyage already exists for schedule ${schedule.id}`);
                    continue;
                }

                // Build voyage stops
                interface VoyageStopData {
                    locationId: string;
                    arrivalTime: string | null;
                    departureTime: string | null;
                    activities: string[];
                    notes: string | null;
                    stopOrder: number;
                }

                const voyageStopsMap = new Map<string, VoyageStopData>();
                let stopOrderCounter = 1;
                let overallFromLocation: typeof allLocations[0] | null = null;
                let overallToLocation: typeof allLocations[0] | null = null;

                for (const event of schedule.events) {
                    const fromLocStr = event.fromLocation || event.location || "";
                    const toLocStr = event.toLocation || event.location || "";
                    const depTime = event.departureTime || event.startTime || null;
                    const arrTime = event.arrivalTime || event.endTime || null;

                    const fromLoc = resolveLocation(fromLocStr);
                    const toLoc = resolveLocation(toLocStr);

                    if (!fromLoc) continue;

                    if (!overallFromLocation) {
                        overallFromLocation = fromLoc;
                    }

                    // Add fromLocation
                    if (!voyageStopsMap.has(fromLoc.id)) {
                        voyageStopsMap.set(fromLoc.id, {
                            locationId: fromLoc.id,
                            arrivalTime: null,
                            departureTime: depTime,
                            activities: [event.type],
                            notes: event.notes || null,
                            stopOrder: stopOrderCounter++,
                        });
                    } else {
                        const existing = voyageStopsMap.get(fromLoc.id)!;
                        if (!existing.activities.includes(event.type)) {
                            existing.activities.push(event.type);
                        }
                    }

                    // Add intermediate stops
                    if (event.stops && event.stops.length > 0) {
                        for (const stop of event.stops) {
                            const stopLoc = resolveLocation(stop.location);
                            if (!stopLoc) continue;

                            if (!voyageStopsMap.has(stopLoc.id)) {
                                voyageStopsMap.set(stopLoc.id, {
                                    locationId: stopLoc.id,
                                    arrivalTime: stop.arrivalTime || null,
                                    departureTime: stop.departureTime || null,
                                    activities: stop.activities || [],
                                    notes: stop.notes || null,
                                    stopOrder: stopOrderCounter++,
                                });
                            }
                        }
                    }

                    // Add toLocation
                    if (toLoc && toLoc.id !== fromLoc.id) {
                        overallToLocation = toLoc;
                        if (!voyageStopsMap.has(toLoc.id)) {
                            voyageStopsMap.set(toLoc.id, {
                                locationId: toLoc.id,
                                arrivalTime: arrTime,
                                departureTime: null,
                                activities: [event.type],
                                notes: event.notes || null,
                                stopOrder: stopOrderCounter++,
                            });
                        }
                    }
                }

                const voyageStops = Array.from(voyageStopsMap.values())
                    .sort((a, b) => a.stopOrder - b.stopOrder);

                if (voyageStops.length === 0 || !overallFromLocation) {
                    continue;
                }

                if (!overallToLocation) {
                    const lastStopId = voyageStops[voyageStops.length - 1].locationId;
                    overallToLocation = allLocations.find(l => l.id === lastStopId) || overallFromLocation;
                }

                const voyageNo = nextVoyageNo++;

                // Create voyage with transaction
                await prisma.$transaction(async (tx) => {
                    const newVoyage = await tx.voyage.create({
                        data: {
                            voyageNo,
                            shipName: schedule.shipName,
                            date: schedule.date,
                            fromId: overallFromLocation!.id,
                            toId: overallToLocation!.id,
                            status: "SCHEDULED",
                            scheduleId: schedule.id,
                        },
                    });

                    const stopsData = voyageStops.map((stop, index) => ({
                        voyageId: newVoyage.id,
                        locationId: stop.locationId,
                        stopOrder: index + 1,
                        arrivalTime: index === 0 ? null : stop.arrivalTime,
                        departureTime: index === voyageStops.length - 1 ? null : stop.departureTime,
                        activities: stop.activities,
                        notes: stop.notes,
                    }));

                    await tx.voyageStop.createMany({ data: stopsData });

                    return newVoyage;
                });

                createdVoyages.push(`Voyage #${voyageNo} for ${schedule.shipName}`);
                console.log(`[Cron] Created voyage #${voyageNo} for schedule ${schedule.id}`);

            } catch (err: any) {
                console.error(`[Cron] Error creating voyage for schedule ${schedule.id}:`, err);
                errors.push(`Schedule ${schedule.id}: ${err.message}`);
            }
        }

        // Create audit log entry for cron job
        await prisma.auditLog.create({
            data: {
                action: "CRON_LAUNCH_SCHEDULES",
                entity: "schedule",
                metadata: {
                    schedulesLaunched: scheduleIds.length,
                    voyagesCreated: createdVoyages.length,
                    errors: errors.length > 0 ? errors : undefined,
                },
            },
        });

        console.log(`[Cron] Completed: ${scheduleIds.length} schedules launched, ${createdVoyages.length} voyages created`);

        return NextResponse.json({
            message: "Cron job completed",
            launched: scheduleIds.length,
            voyagesCreated: createdVoyages.length,
            voyages: createdVoyages,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error("[Cron] Error in launch-schedules:", error);
        return NextResponse.json(
            { error: error.message || "Cron job failed" },
            { status: 500 }
        );
    }
}
