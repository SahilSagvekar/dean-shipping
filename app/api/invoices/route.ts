// ============================================
// GET /api/invoices - List invoices
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined; // 'cargo' or 'passenger'
    const skip = (page - 1) * limit;

    const where: any = {};

    // Users only see their own invoices
    // if (result.user.role === "USER") {
    //     where.userId = result.user.id;
    // }

    if (status) where.paymentStatus = status;

    if (type === 'cargo') {
        where.cargoBookingId = { not: null };
    } else if (type === 'passenger') {
        where.passengerBookingId = { not: null };
    }

    if (search) {
        where.OR = [
            { invoiceNo: { contains: search, mode: "insensitive" } },
            { user: { firstName: { contains: search, mode: "insensitive" } } },
            { user: { lastName: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
        ];
    }

    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        mobileNumber: true
                    },
                },
                cargoBooking: {
                    select: {
                        id: true,
                        service: true,
                        fromLocation: true,
                        toLocation: true,
                        type: true,
                        cargoSize: true,
                        boxContains: true,
                        damageFound: true,
                        contactName: true,
                        contactPhone: true,
                        items: {
                            select: {
                                itemType: true,
                                total: true,
                                quantity: true,
                                unitPrice: true
                            }
                        },
                        images: {
                            select: { imageUrl: true, imageType: true },
                            take: 6
                        },
                    },
                },
                passengerBooking: {
                    select: {
                        id: true,
                        infantCount: true,
                        childCount: true,
                        adultCount: true,
                        fromLocation: true,
                        toLocation: true,
                        name: true,
                        contact: true,
                        email: true,
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