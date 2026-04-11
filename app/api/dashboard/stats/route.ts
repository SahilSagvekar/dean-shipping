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
    
    if (range === "7d") {
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
        ] = await Promise.all([
            // Total shipments in range
            prisma.cargoBooking.count({
                where: { createdAt: { gte: startDate, lt: tomorrow } },
            }),
            // Total shipments in previous range
            prisma.cargoBooking.count({
                where: { createdAt: { gte: prevStartDate, lt: startDate } },
            }),
            // Cash collected in range
            prisma.invoice.aggregate({
                where: { paidAt: { gte: startDate, lt: tomorrow }, paymentStatus: "PAID" },
                _sum: { totalAmount: true },
                _count: true,
            }),
            // Cash collected in previous range
            prisma.invoice.aggregate({
                where: { paidAt: { gte: prevStartDate, lt: startDate }, paymentStatus: "PAID" },
                _sum: { totalAmount: true },
            }),
            // Total revenue in range
            prisma.invoice.aggregate({
                where: { createdAt: { gte: startDate, lt: tomorrow } },
                _sum: { totalAmount: true },
            }),
            // Total revenue in previous range
            prisma.invoice.aggregate({
                where: { createdAt: { gte: prevStartDate, lt: startDate } },
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
                where: {
                    paymentStatus: "UNPAID",
                    bookingDate: { gte: startDate, lt: tomorrow },
                },
            }),
            // Completed pickups in range
            prisma.cargoBooking.count({
                where: {
                    paymentStatus: "PAID",
                    bookingDate: { gte: startDate, lt: tomorrow },
                },
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
                where: { createdAt: { gte: startDate, lt: tomorrow } },
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
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

