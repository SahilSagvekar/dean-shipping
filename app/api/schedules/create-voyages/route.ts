// ============================================
// POST /api/schedules/create-voyages
// ============================================
// When schedules are published, this endpoint
// auto-creates Voyages with VoyageStops from the schedule events.
// 
// New format support:
// - Each ScheduleEvent has fromLocation, toLocation, and intermediate stops[]
// - Creates one Voyage per Schedule (not per event)
// - VoyageStops are built from: fromLocation → stops[] → toLocation

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { scheduleIds } = body;

        if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
            return NextResponse.json(
                { error: "scheduleIds array is required" },
                { status: 400 }
            );
        }

        // Fetch all the schedules with their events and stops
        const schedules = await prisma.schedule.findMany({
            where: {
                id: { in: scheduleIds },
            },
            include: {
                events: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        stops: { orderBy: { stopOrder: "asc" } },
                    },
                },
                voyages: true,
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

        // Fetch all locations for name/code resolution
        const allLocations = await prisma.location.findMany();
        const locationByName: Record<string, typeof allLocations[0]> = {};
        const locationByCode: Record<string, typeof allLocations[0]> = {};
        allLocations.forEach((loc) => {
            locationByName[loc.name.toLowerCase()] = loc;
            locationByCode[loc.code.toLowerCase()] = loc;
        });

        // Helper to resolve a location string (name or code)
        const resolveLocation = (str: string | null | undefined) => {
            if (!str) return null;
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

            // Skip schedules with no events
            if (schedule.events.length === 0) {
                skippedSchedules.push(schedule.id);
                continue;
            }

            // Build voyage stops from all events
            // Each event represents a journey: fromLocation → stops[] → toLocation
            // We'll create a unified list of VoyageStops for the entire schedule
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

            // Track the overall voyage from/to
            let overallFromLocation: typeof allLocations[0] | null = null;
            let overallToLocation: typeof allLocations[0] | null = null;

            for (const event of schedule.events) {
                // Use new format fields first, fallback to legacy
                const fromLocStr = event.fromLocation || event.location || "";
                const toLocStr = event.toLocation || event.location || "";
                const depTime = event.departureTime || event.startTime || null;
                const arrTime = event.arrivalTime || event.endTime || null;

                const fromLoc = resolveLocation(fromLocStr);
                const toLoc = resolveLocation(toLocStr);

                if (!fromLoc) {
                    console.warn(`Could not resolve fromLocation "${fromLocStr}" for schedule ${schedule.id}`);
                    continue;
                }

                // Set overall voyage from (first event's from)
                if (!overallFromLocation) {
                    overallFromLocation = fromLoc;
                }

                // Add fromLocation as a stop (departure point)
                if (!voyageStopsMap.has(fromLoc.id)) {
                    voyageStopsMap.set(fromLoc.id, {
                        locationId: fromLoc.id,
                        arrivalTime: null, // First stop has no arrival
                        departureTime: depTime,
                        activities: [event.type],
                        notes: event.notes || null,
                        stopOrder: stopOrderCounter++,
                    });
                } else {
                    // Merge with existing stop
                    const existing = voyageStopsMap.get(fromLoc.id)!;
                    if (!existing.activities.includes(event.type)) {
                        existing.activities.push(event.type);
                    }
                    if (event.notes && !existing.notes?.includes(event.notes)) {
                        existing.notes = existing.notes ? `${existing.notes}; ${event.notes}` : event.notes;
                    }
                    if (depTime && !existing.departureTime) {
                        existing.departureTime = depTime;
                    }
                }

                // Add intermediate stops
                if (event.stops && event.stops.length > 0) {
                    for (const stop of event.stops) {
                        const stopLoc = resolveLocation(stop.location);
                        if (!stopLoc) {
                            console.warn(`Could not resolve intermediate stop "${stop.location}" for schedule ${schedule.id}`);
                            continue;
                        }

                        if (!voyageStopsMap.has(stopLoc.id)) {
                            voyageStopsMap.set(stopLoc.id, {
                                locationId: stopLoc.id,
                                arrivalTime: stop.arrivalTime || null,
                                departureTime: stop.departureTime || null,
                                activities: stop.activities || [],
                                notes: stop.notes || null,
                                stopOrder: stopOrderCounter++,
                            });
                        } else {
                            // Merge with existing stop
                            const existing = voyageStopsMap.get(stopLoc.id)!;
                            for (const activity of (stop.activities || [])) {
                                if (!existing.activities.includes(activity)) {
                                    existing.activities.push(activity);
                                }
                            }
                            if (stop.notes && !existing.notes?.includes(stop.notes)) {
                                existing.notes = existing.notes ? `${existing.notes}; ${stop.notes}` : stop.notes;
                            }
                        }
                    }
                }

                // Add toLocation as a stop (arrival point)
                if (toLoc && toLoc.id !== fromLoc.id) {
                    overallToLocation = toLoc; // Update overall destination

                    if (!voyageStopsMap.has(toLoc.id)) {
                        voyageStopsMap.set(toLoc.id, {
                            locationId: toLoc.id,
                            arrivalTime: arrTime,
                            departureTime: null, // Final stop has no departure
                            activities: [event.type],
                            notes: event.notes || null,
                            stopOrder: stopOrderCounter++,
                        });
                    } else {
                        // Merge with existing stop
                        const existing = voyageStopsMap.get(toLoc.id)!;
                        if (!existing.activities.includes(event.type)) {
                            existing.activities.push(event.type);
                        }
                        if (arrTime && !existing.arrivalTime) {
                            existing.arrivalTime = arrTime;
                        }
                    }
                }
            }

            // Convert map to array and sort by stopOrder
            const voyageStops = Array.from(voyageStopsMap.values())
                .sort((a, b) => a.stopOrder - b.stopOrder);

            // Skip if no valid stops were created
            if (voyageStops.length === 0 || !overallFromLocation) {
                skippedSchedules.push(schedule.id);
                continue;
            }

            // If no separate toLocation, use the last stop
            if (!overallToLocation) {
                const lastStopId = voyageStops[voyageStops.length - 1].locationId;
                overallToLocation = allLocations.find(l => l.id === lastStopId) || overallFromLocation;
            }

            const voyageNo = nextVoyageNo++;

            // Create the voyage with stops in a transaction
            const voyage = await prisma.$transaction(async (tx) => {
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

                // Reassign stopOrder sequentially
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

            // Fetch the complete voyage with relations
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
                    stopsCount: voyageStops.length,
                    shipName: schedule.shipName,
                    from: overallFromLocation?.code,
                    to: overallToLocation?.code,
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