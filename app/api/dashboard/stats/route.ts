// ============================================
// GET /api/dashboard/stats - Dashboard statistics
// ============================================
// Aggregated stats for the admin dashboard

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today"; // today, 7d, 30d

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate start date based on range
    let startDate = new Date(today);
    let prevStartDate = new Date(today);
    const isAllTime = range === "all";
    
    if (isAllTime) {
        startDate = new Date(0); // epoch
        prevStartDate = new Date(0);
    } else if (range === "7d") {
        startDate.setDate(startDate.getDate() - 7);
        prevStartDate.setDate(prevStartDate.getDate() - 14);
    } else if (range === "30d") {
        startDate.setDate(startDate.getDate() - 30);
        prevStartDate.setDate(prevStartDate.getDate() - 60);
    } else {
        // Default: today
        startDate = today;
        prevStartDate = new Date(today);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
    }

    try {
        // Run all queries in parallel
        const [
            totalShipments,
            totalShipmentsPrev,
            paidInvoices,
            paidInvoicesPrev,
            totalRevenue,
            totalRevenuePrev,
            pendingPayments,
            pendingPickups,
            completedPickups,
            recentCargoBookings,
            allCargoBookingsInRange,
            recentPassengerBookings,
            recentActivity,
            upcomingVoyages,
            recentIncidents,
            openIncidentsCount,
            revenueChartData,
        ] = await Promise.all([
            // Total shipments in range
            prisma.cargoBooking.count({
                where: isAllTime ? {} : { createdAt: { gte: startDate, lt: tomorrow } },
            }),
            // Total shipments in previous range
            prisma.cargoBooking.count({
                where: isAllTime ? {} : { createdAt: { gte: prevStartDate, lt: startDate } },
            }),
            // Cash collected in range
            prisma.invoice.aggregate({
                where: isAllTime
                    ? { paymentStatus: "PAID" }
                    : { paidAt: { gte: startDate, lt: tomorrow }, paymentStatus: "PAID" },
                _sum: { totalAmount: true },
                _count: true,
            }),
            // Cash collected in previous range
            prisma.invoice.aggregate({
                where: isAllTime
                    ? { paymentStatus: "PAID" }
                    : { paidAt: { gte: prevStartDate, lt: startDate }, paymentStatus: "PAID" },
                _sum: { totalAmount: true },
            }),
            // Total revenue in range
            prisma.invoice.aggregate({
                where: isAllTime ? {} : { createdAt: { gte: startDate, lt: tomorrow } },
                _sum: { totalAmount: true },
            }),
            // Total revenue in previous range
            prisma.invoice.aggregate({
                where: isAllTime ? {} : { createdAt: { gte: prevStartDate, lt: startDate } },
                _sum: { totalAmount: true },
            }),
            // Pending payments (Global)
            prisma.invoice.aggregate({
                where: { paymentStatus: "UNPAID" },
                _count: true,
                _sum: { totalAmount: true },
            }),
            // Pending pickups in range
            prisma.cargoBooking.count({
                where: isAllTime
                    ? { paymentStatus: "UNPAID" }
                    : { paymentStatus: "UNPAID", bookingDate: { gte: startDate, lt: tomorrow } },
            }),
            // Completed pickups in range
            prisma.cargoBooking.count({
                where: isAllTime
                    ? { paymentStatus: "PAID" }
                    : { paymentStatus: "PAID", bookingDate: { gte: startDate, lt: tomorrow } },
            }),
            // Recent cargo bookings (limit for UI)
            prisma.cargoBooking.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    items: { select: { itemType: true, total: true } },
                    invoice: { select: { paymentMode: true, paymentStatus: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 15,
            }),
            // All cargo bookings in range (for export)
            prisma.cargoBooking.findMany({
                where: isAllTime ? {} : { createdAt: { gte: startDate, lt: tomorrow } },
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    items: { select: { itemType: true, total: true } },
                    invoice: { select: { paymentMode: true, paymentStatus: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            // Recent passenger bookings
            prisma.passengerBooking.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            // Recent audit logs
            prisma.auditLog.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            // Upcoming voyages
            prisma.voyage.findMany({
                where: { date: { gte: new Date() } },
                include: {
                    from: { select: { code: true, name: true } },
                    to: { select: { code: true, name: true } },
                    stops: {
                        include: {
                            location: { select: { code: true, name: true } },
                        },
                        orderBy: { stopOrder: "asc" },
                    },
                    _count: {
                        select: {
                            cargoBookings: true,
                            passengerBookings: true,
                        },
                    },
                },
                orderBy: { date: "asc" },
                take: 5,
            }),
            // Recent incident reports
            prisma.incidentReport.findMany({
                where: { status: "OPEN" },
                include: {
                    reportedBy: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.incidentReport.count({ where: { status: "OPEN" } }),
            // Revenue chart data - group invoices by time buckets based on range
            (async () => {
                const invoices = await prisma.invoice.findMany({
                    where: {
                        createdAt: isAllTime ? undefined : { gte: startDate, lt: tomorrow },
                    },
                    select: { totalAmount: true, createdAt: true },
                    orderBy: { createdAt: "asc" },
                });

                let numBuckets = 7;
                let startTs: number;
                let endTs: number;

                if (range === "today") {
                    numBuckets = 12; // Every 2 hours
                    startTs = startDate.getTime();
                    endTs = tomorrow.getTime();
                } else if (range === "7d") {
                    numBuckets = 7; // Daily
                    startTs = startDate.getTime();
                    endTs = tomorrow.getTime();
                } else if (range === "30d") {
                    numBuckets = 10; // Every 3 days
                    startTs = startDate.getTime();
                    endTs = tomorrow.getTime();
                } else {
                    // All time
                    numBuckets = 12;
                    if (invoices.length > 0) {
                        startTs = invoices[0].createdAt.getTime();
                        endTs = invoices[invoices.length - 1].createdAt.getTime() + 1000;
                        if (endTs - startTs < 24 * 60 * 60 * 1000) {
                            // If span is less than a day, show at least a day
                            endTs = startTs + 24 * 60 * 60 * 1000;
                        }
                    } else {
                        // No invoices at all, show last 7 days as empty
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 7);
                        startTs = start.getTime();
                        endTs = end.getTime();
                    }
                }

                const totalSpan = endTs - startTs;
                const bucketSize = totalSpan / numBuckets;
                const buckets = [];

                for (let i = 0; i < numBuckets; i++) {
                    const bStart = new Date(startTs + i * bucketSize);
                    const bEnd = new Date(startTs + (i + 1) * bucketSize);

                    const total = invoices
                        .filter((inv) => inv.createdAt >= bStart && inv.createdAt < bEnd)
                        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

                    let label = "";
                    if (range === "today") {
                        label = bStart.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
                    } else if (range === "all" && totalSpan > 365 * 24 * 60 * 60 * 1000) {
                        label = bStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                    } else {
                        label = bStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }

                    buckets.push({
                        name: label,
                        value: Math.round(total * 100) / 100,
                    });
                }

                return buckets;
            })(),
        ]);

        // Calculate percentage changes
        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const cashCurrent = paidInvoices._sum.totalAmount || 0;
        const cashPrev = paidInvoicesPrev._sum.totalAmount || 0;
        const revCurrent = totalRevenue._sum.totalAmount || 0;
        const revPrev = totalRevenuePrev._sum.totalAmount || 0;

        // Group cargo bookings by type for dashboard tables
        const dryShipments = recentCargoBookings.filter((b: any) => b.type === "DRY");
        const frozenShipments = recentCargoBookings.filter((b: any) => b.type === "FROZEN");
        const coolerShipments = recentCargoBookings.filter((b: any) => b.type === "COOLER");

        return NextResponse.json({
            range,
            stats: {
                totalShipmentsToday: totalShipments,
                shipmentsChange: calcChange(totalShipments, totalShipmentsPrev),
                cashCollectedToday: cashCurrent,
                cashChange: calcChange(cashCurrent, cashPrev),
                totalRevenueToday: revCurrent,
                revenueChange: calcChange(revCurrent, revPrev),
                pendingPaymentCount: pendingPayments._count || 0,
                pendingPaymentTotal: pendingPayments._sum.totalAmount || 0,
                pendingPickups,
                completedPickups,
                openIncidentsCount,
            },
            recentShipments: {
                dry: dryShipments.slice(0, 5),
                frozen: frozenShipments.slice(0, 5),
                cooler: coolerShipments.slice(0, 5),
            },
            allRecentShipments: allCargoBookingsInRange, // For CSV export
            recentActivity,
            recentPassengerBookings,
            upcomingVoyages,
            recentIncidents,
            revenueChartData,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}