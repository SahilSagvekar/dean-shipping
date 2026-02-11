// ============================================
// GET /api/bookings/cargo - List cargo bookings
// POST /api/bookings/cargo - Create a cargo booking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

// Helper to generate invoice number
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
    const type = searchParams.get("type") || undefined; // DRY, FROZEN
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Regular users can only see their own bookings
    if (result.user.role === "USER") {
        where.userId = result.user.id;
    }

    if (status) where.paymentStatus = status;
    if (type) where.type = type;
    if (from) where.fromLocation = from;
    if (to) where.toLocation = to;

    const [bookings, total] = await Promise.all([
        prisma.cargoBooking.findMany({
            where,
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                items: true,
                _count: { select: { images: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.cargoBooking.count({ where }),
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
            service, cargoSize, quantity, pallets, type, containerNo,
            size, height, reeferNo, material, color, chassisNo,
            temperature, decksNo, boxContains, bookingDate,
            fromLocation, toLocation, voyageNo,
            contactName, contactEmail, contactPhone, address, idType,
            damageFound, damageLocation, deficiencyComment,
            paymentStatus, remark, items,
        } = body;

        if (!service || !bookingDate || !fromLocation || !toLocation || !contactName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Calculate total from items
        let totalAmount = 0;
        if (items && items.length > 0) {
            totalAmount = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
        }
        const vatAmount = totalAmount * 0.12;
        const grandTotal = totalAmount + vatAmount;

        const booking = await prisma.cargoBooking.create({
            data: {
                invoiceNo,
                userId: result.user.id,
                service,
                cargoSize: cargoSize || "MEDIUM",
                quantity: quantity ? parseInt(quantity) : undefined,
                pallets: pallets ? parseInt(pallets) : undefined,
                type: type || "DRY",
                containerNo,
                size,
                height,
                reeferNo,
                material,
                color,
                chassisNo,
                temperature,
                decksNo,
                boxContains,
                bookingDate: new Date(bookingDate),
                fromLocation,
                toLocation,
                voyageNo,
                contactName,
                contactEmail: contactEmail || result.user.email,
                contactPhone: contactPhone || "",
                address: address || "",
                idType: idType || "Passport",
                damageFound,
                damageLocation,
                deficiencyComment,
                paymentStatus: paymentStatus || "UNPAID",
                totalAmount: grandTotal,
                remark,
                items: {
                    create: (items || []).map((item: any) => ({
                        itemType: item.itemType || item.type,
                        unitPrice: parseFloat(item.unitPrice) || 0,
                        quantity: parseInt(item.quantity) || 1,
                        total: parseFloat(item.total) || 0,
                        isPaid: item.isPaid || false,
                    })),
                },
            },
            include: { items: true },
        });

        // Create invoice
        await prisma.invoice.create({
            data: {
                invoiceNo,
                userId: result.user.id,
                cargoBookingId: booking.id,
                amount: totalAmount,
                vatAmount,
                totalAmount: grandTotal,
                paymentStatus: paymentStatus || "UNPAID",
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_CARGO_BOOKING",
            entity: "cargo_booking",
            entityId: booking.id,
            metadata: { invoiceNo, fromLocation, toLocation, totalAmount: grandTotal },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ booking, invoiceNo }, { status: 201 });
    } catch (error: any) {
        console.error("Create cargo booking error:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
