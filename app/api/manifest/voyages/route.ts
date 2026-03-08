// ============================================
// GET /api/manifest/voyages
// ============================================
// Returns all voyages with per-voyage cargo booking
// counts broken down by type (DRY / FROZEN / COOLER),
// plus revenue and paid/unpaid summaries.
// Used by the Manifest page to build the voyage accordion list.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const status = searchParams.get("status") || undefined; // VoyageStatus filter
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    try {
        const [voyages, total] = await Promise.all([
            prisma.voyage.findMany({
                where,
                include: {
                    from: { select: { code: true, name: true } },
                    to: { select: { code: true, name: true } },
                    stops: {
                        include: {
                            location: { select: { id: true, code: true, name: true } },
                        },
                        orderBy: { stopOrder: "asc" },
                    },
                    // Pull only the lightweight fields we need for summary
                    cargoBookings: {
                        select: {
                            type: true,
                            totalAmount: true,
                            paymentStatus: true,
                            fromLocation: true,
                            toLocation: true,
                        },
                    },
                    passengerBookings: {
                        select: {
                            totalAmount: true,
                            paymentStatus: true,
                            adultCount: true,
                            childCount: true,
                            infantCount: true,
                        },
                    },
                },
                orderBy: { date: "desc" },
                skip,
                take: limit,
            }),
            prisma.voyage.count({ where }),
        ]);

        // Build a summary object for each voyage
        const voyagesWithSummary = voyages.map((voyage) => {
            const bookings = voyage.cargoBookings;
            const passengers = voyage.passengerBookings;

            const dryCount = bookings.filter((b) => b.type === "DRY").length;
            const frozenCount = bookings.filter((b) => b.type === "FROZEN").length;
            const coolerCount = bookings.filter((b) => b.type === "COOLER").length;

            const cargoAmount = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
            const passengerAmount = passengers.reduce((sum, b) => sum + b.totalAmount, 0);
            const totalAmount = cargoAmount + passengerAmount;
            const paidAmount = [
                ...bookings.filter((b) => b.paymentStatus === "PAID"),
                ...passengers.filter((b) => b.paymentStatus === "PAID"),
            ].reduce((sum, b) => sum + b.totalAmount, 0);

            const totalPassengers = passengers.reduce(
                (sum, b) => sum + b.adultCount + b.childCount + b.infantCount,
                0
            );

            return {
                id: voyage.id,
                voyageNo: voyage.voyageNo,
                shipName: voyage.shipName,
                date: voyage.date,
                status: voyage.status,
                from: voyage.from,
                to: voyage.to,
                stops: voyage.stops,
                summary: {
                    totalBookings: bookings.length + passengers.length,
                    cargoBookings: bookings.length,
                    passengerBookings: passengers.length,
                    totalPassengers,
                    dry: dryCount,
                    frozen: frozenCount,
                    cooler: coolerCount,
                    totalAmount,
                    paidAmount,
                    unpaidAmount: totalAmount - paidAmount,
                },
            };
        });

        return NextResponse.json({
            voyages: voyagesWithSummary,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Manifest voyages list error:", error);
        return NextResponse.json(
            { error: "Failed to fetch voyages" },
            { status: 500 }
        );
    }
}
