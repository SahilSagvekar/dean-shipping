// ============================================
// GET /api/invoices - List invoices
// ============================================
// Supports filtering by payment status (for Cashier page)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined; // PAID or UNPAID
    const search = searchParams.get("search") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Users only see their own invoices
    if (result.user.role === "USER") {
        where.userId = result.user.id;
    }

    if (status) where.paymentStatus = status;
    if (search) {
        where.OR = [
            { invoiceNo: { contains: search } },
            { user: { firstName: { contains: search, mode: "insensitive" } } },
            { user: { lastName: { contains: search, mode: "insensitive" } } },
        ];
    }

    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                cargoBooking: {
                    select: {
                        service: true,
                        fromLocation: true,
                        toLocation: true,
                        type: true,
                        items: { select: { itemType: true, total: true } },
                    },
                },
                passengerBooking: {
                    select: {
                        infantCount: true,
                        childCount: true,
                        adultCount: true,
                        fromLocation: true,
                        toLocation: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
        invoices,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}
