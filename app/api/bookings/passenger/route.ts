// ============================================
// GET /api/bookings/passenger - List passenger bookings
// POST /api/bookings/passenger - Create a passenger booking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";

function generateInvoiceNo(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (result.user.role === "USER") {
        where.userId = result.user.id;
    }
    if (status) where.paymentStatus = status;

    const [bookings, total] = await Promise.all([
        prisma.passengerBooking.findMany({
            where,
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                _count: { select: { images: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.passengerBooking.count({ where }),
    ]);

    return NextResponse.json({
        bookings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const invoiceNo = generateInvoiceNo();

        const {
            infantCount, childCount, adultCount,
            name, email, contact,
            bookingDate, fromLocation, toLocation, idType,
            paymentStatus, remark, totalAmount,
        } = body;

        if (!name || !bookingDate || !fromLocation || !toLocation) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const amount = parseFloat(totalAmount) || 0;
        const vatAmount = amount * 0.12;
        const grandTotal = amount + vatAmount;

        const booking = await prisma.passengerBooking.create({
            data: {
                invoiceNo,
                userId: result.user.id,
                infantCount: parseInt(infantCount) || 0,
                childCount: parseInt(childCount) || 0,
                adultCount: parseInt(adultCount) || 0,
                name,
                email: email || result.user.email,
                contact: contact || "",
                bookingDate: new Date(bookingDate),
                fromLocation,
                toLocation,
                idType: idType || "Passport",
                paymentStatus: paymentStatus || "UNPAID",
                totalAmount: grandTotal,
                remark,
            },
        });

        // Create invoice
        await prisma.invoice.create({
            data: {
                invoiceNo,
                userId: result.user.id,
                passengerBookingId: booking.id,
                subtotal: amount,
                vatAmount,
                totalAmount: grandTotal,
                paymentStatus: paymentStatus || "UNPAID",
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_PASSENGER_BOOKING",
            entity: "passenger_booking",
            entityId: booking.id,
            metadata: {
                invoiceNo,
                passengers: (parseInt(infantCount) || 0) + (parseInt(childCount) || 0) + (parseInt(adultCount) || 0),
                fromLocation,
                toLocation,
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ booking, invoiceNo }, { status: 201 });
    } catch (error: any) {
        console.error("Create passenger booking error:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}