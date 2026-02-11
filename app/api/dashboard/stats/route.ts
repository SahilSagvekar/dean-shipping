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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
        // Run all queries in parallel
        const [
            totalShipmentsToday,
            totalShipmentsYesterday,
            paidInvoicesToday,
            paidInvoicesYesterday,
            totalRevenueToday,
            totalRevenueYesterday,
            pendingPayments,
            pendingPickups,
            completedPickups,
            recentCargoBookings,
            recentPassengerBookings,
            recentActivity,
        ] = await Promise.all([
            // Total shipments today
            prisma.cargoBooking.count({
                where: { createdAt: { gte: today, lt: tomorrow } },
            }),
            // Total shipments yesterday
            prisma.cargoBooking.count({
                where: { createdAt: { gte: yesterday, lt: today } },
            }),
            // Cash collected today (paid invoices)
            prisma.invoice.aggregate({
                where: { paidAt: { gte: today, lt: tomorrow }, paymentStatus: "PAID" },
                _sum: { totalAmount: true },
                _count: true,
            }),
            // Cash collected yesterday
            prisma.invoice.aggregate({
                where: { paidAt: { gte: yesterday, lt: today }, paymentStatus: "PAID" },
                _sum: { totalAmount: true },
            }),
            // Total revenue today (all invoices)
            prisma.invoice.aggregate({
                where: { createdAt: { gte: today, lt: tomorrow } },
                _sum: { totalAmount: true },
            }),
            // Total revenue yesterday
            prisma.invoice.aggregate({
                where: { createdAt: { gte: yesterday, lt: today } },
                _sum: { totalAmount: true },
            }),
            // Pending payments
            prisma.invoice.aggregate({
                where: { paymentStatus: "UNPAID" },
                _count: true,
                _sum: { totalAmount: true },
            }),
            // Pending pickups (unpaid cargo bookings for today)
            prisma.cargoBooking.count({
                where: {
                    paymentStatus: "UNPAID",
                    bookingDate: { gte: today, lt: tomorrow },
                },
            }),
            // Completed pickups (paid cargo bookings for today)
            prisma.cargoBooking.count({
                where: {
                    paymentStatus: "PAID",
                    bookingDate: { gte: today, lt: tomorrow },
                },
            }),
            // Recent DRY/FROZEN/COOLER shipments
            prisma.cargoBooking.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    items: { select: { itemType: true, total: true } },
                    invoice: { select: { paymentMode: true, paymentStatus: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 15,
            }),
            // Recent passenger bookings
            prisma.passengerBooking.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            // Recent audit logs (activity feed)
            prisma.auditLog.findMany({
                include: {
                    user: { select: { firstName: true, lastName: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
        ]);

        // Calculate percentage changes
        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const cashToday = paidInvoicesToday._sum.totalAmount || 0;
        const cashYesterday = paidInvoicesYesterday._sum.totalAmount || 0;
        const revToday = totalRevenueToday._sum.totalAmount || 0;
        const revYesterday = totalRevenueYesterday._sum.totalAmount || 0;

        // Group cargo bookings by type for the dashboard tables
        const dryShipments = recentCargoBookings.filter((b: any) => b.type === "DRY");
        const frozenShipments = recentCargoBookings.filter((b: any) => b.type === "FROZEN");
        const coolerShipments = recentCargoBookings.filter((b: any) => b.type === "COOLER");

        return NextResponse.json({
            stats: {
                totalShipmentsToday,
                shipmentsChange: calcChange(totalShipmentsToday, totalShipmentsYesterday),
                cashCollectedToday: cashToday,
                cashChange: calcChange(cashToday, cashYesterday),
                totalRevenueToday: revToday,
                revenueChange: calcChange(revToday, revYesterday),
                pendingPaymentCount: pendingPayments._count || 0,
                pendingPaymentTotal: pendingPayments._sum.totalAmount || 0,
                pendingPickups,
                completedPickups,
            },
            recentShipments: {
                dry: dryShipments.slice(0, 5),
                frozen: frozenShipments.slice(0, 5),
                cooler: coolerShipments.slice(0, 5),
            },
            recentActivity,
            recentPassengerBookings,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
