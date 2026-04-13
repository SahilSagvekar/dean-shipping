// ============================================
// GET /api/dashboard/export - Export cargo bookings as JSON (for CSV)
// ============================================
// Separated from /api/dashboard/stats to avoid loading
// unbounded data on every dashboard page load.
// Supports pagination for large date ranges.

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") || "100")));
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let startDate = new Date(today);
    if (range === "7d") {
        startDate.setDate(startDate.getDate() - 7);
    } else if (range === "30d") {
        startDate.setDate(startDate.getDate() - 30);
    } else if (range === "90d") {
        startDate.setDate(startDate.getDate() - 90);
    }

    try {
        const where = {
            createdAt: { gte: startDate, lt: tomorrow },
        };

        const [bookings, total] = await Promise.all([
            prisma.cargoBooking.findMany({
                where,
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    items: { select: { itemType: true, total: true } },
                    invoice: { select: { paymentMode: true, paymentStatus: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.cargoBooking.count({ where }),
        ]);

        return NextResponse.json({
            bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Dashboard export error:", error);
        return NextResponse.json(
            { error: "Failed to fetch export data" },
            { status: 500 }
        );
    }
}