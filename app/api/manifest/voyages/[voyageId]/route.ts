// ============================================
// GET /api/manifest/voyages/[voyageId]
// ============================================
// Returns a single voyage with its stops, and all
// cargo + passenger bookings organized by stop.
// For each stop, shows what to LOAD, UNLOAD, and
// what STAYS ON BOARD — exactly what dock workers need.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ voyageId: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { voyageId } = await params;
    const { searchParams } = new URL(request.url);
    const paymentStatusFilter = searchParams.get("paymentStatus") as
        | "PAID"
        | "UNPAID"
        | "PARTIAL"
        | null;

    try {
        const voyage = await prisma.voyage.findUnique({
            where: { id: voyageId },
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
                stops: {
                    include: {
                        location: { select: { id: true, code: true, name: true } },
                    },
                    orderBy: { stopOrder: "asc" },
                },
                cargoBookings: {
                    where: paymentStatusFilter
                        ? { paymentStatus: paymentStatusFilter }
                        : undefined,
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                        items: {
                            select: {
                                itemType: true,
                                quantity: true,
                                total: true,
                            },
                        },
                        invoice: {
                            select: {
                                paymentMode: true,
                                paymentStatus: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
                passengerBookings: {
                    where: paymentStatusFilter
                        ? { paymentStatus: paymentStatusFilter }
                        : undefined,
                    include: {
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                        luggage: true,
                        invoice: {
                            select: {
                                paymentMode: true,
                                paymentStatus: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!voyage) {
            return NextResponse.json(
                { error: "Voyage not found" },
                { status: 404 }
            );
        }

        // Build the stop-by-stop manifest view
        // For each stop, determine: what loads, what unloads, what stays on board
        const stops = voyage.stops;
        const allCargo = voyage.cargoBookings;
        const allPassengers = voyage.passengerBookings;

        // Build a lookup: location code → stop order
        const stopOrderByCode: Record<string, number> = {};
        for (const stop of stops) {
            stopOrderByCode[stop.location.code] = stop.stopOrder;
            // Also map by name for legacy bookings that may use name instead of code
            stopOrderByCode[stop.location.name] = stop.stopOrder;
        }

        // For each cargo booking, figure out its load stop and unload stop order
        const cargoWithStops = allCargo.map((b) => {
            const loadOrder = stopOrderByCode[b.fromLocation] ?? 1;
            const unloadOrder = stopOrderByCode[b.toLocation] ?? stops.length;
            return {
                ...b,
                bookingType: "CARGO" as const,
                loadStopOrder: loadOrder,
                unloadStopOrder: unloadOrder,
                itemSummary: b.items.map((i) => `${i.itemType} ×${i.quantity}`).join(", "),
            };
        });

        const passengerWithStops = allPassengers.map((b) => {
            const loadOrder = stopOrderByCode[b.fromLocation] ?? 1;
            const unloadOrder = stopOrderByCode[b.toLocation] ?? stops.length;
            const pax = b.adultCount + b.childCount + b.infantCount;
            return {
                ...b,
                bookingType: "PASSENGER" as const,
                loadStopOrder: loadOrder,
                unloadStopOrder: unloadOrder,
                itemSummary: `${pax} passenger(s)${b.luggage?.length ? ` + ${b.luggage.length} luggage` : ""}`,
            };
        });

        const allBookings = [...cargoWithStops, ...passengerWithStops];

        // Build per-stop manifest
        const stopManifest = stops.map((stop) => {
            const load = allBookings.filter((b) => b.loadStopOrder === stop.stopOrder);
            const unload = allBookings.filter((b) => b.unloadStopOrder === stop.stopOrder);
            const staysOnBoard = allBookings.filter(
                (b) => b.loadStopOrder < stop.stopOrder && b.unloadStopOrder > stop.stopOrder
            );
            const onBoard = allBookings.filter(
                (b) => b.loadStopOrder <= stop.stopOrder && b.unloadStopOrder >= stop.stopOrder
            );

            return {
                stopOrder: stop.stopOrder,
                location: stop.location,
                arrivalTime: stop.arrivalTime,
                departureTime: stop.departureTime,
                activities: stop.activities,
                notes: stop.notes,
                load,
                unload,
                staysOnBoard,
                onBoard,
                counts: {
                    loading: load.length,
                    unloading: unload.length,
                    stayingOnBoard: staysOnBoard.length,
                    totalOnBoard: onBoard.length,
                },
            };
        });

        // Overall summary
        const totalCargoAmount = allCargo.reduce((sum, b) => sum + b.totalAmount, 0);
        const paidCargoAmount = allCargo
            .filter((b) => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.totalAmount, 0);
        const totalPassengerAmount = allPassengers.reduce((sum, b) => sum + b.totalAmount, 0);
        const paidPassengerAmount = allPassengers
            .filter((b) => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.totalAmount, 0);

        return NextResponse.json({
            voyage: {
                id: voyage.id,
                voyageNo: voyage.voyageNo,
                shipName: voyage.shipName,
                date: voyage.date,
                status: voyage.status,
                from: voyage.from,
                to: voyage.to,
            },
            stops: stopManifest,
            summary: {
                totalCargo: allCargo.length,
                totalPassengers: allPassengers.length,
                totalBookings: allBookings.length,
                totalAmount: totalCargoAmount + totalPassengerAmount,
                paidAmount: paidCargoAmount + paidPassengerAmount,
                unpaidAmount:
                    totalCargoAmount +
                    totalPassengerAmount -
                    paidCargoAmount -
                    paidPassengerAmount,
                cargo: {
                    dry: allCargo.filter((b) => b.type === "DRY").length,
                    frozen: allCargo.filter((b) => b.type === "FROZEN").length,
                    cooler: allCargo.filter((b) => b.type === "COOLER").length,
                },
            },
        });
    } catch (error) {
        console.error("Manifest voyage detail error:", error);
        return NextResponse.json(
            { error: "Failed to fetch voyage details" },
            { status: 500 }
        );
    }
}
