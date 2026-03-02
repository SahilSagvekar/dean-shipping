// ============================================
// GET /api/bookings/cargo - List cargo bookings
// POST /api/bookings/cargo - Create a cargo booking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";

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
    const type = searchParams.get("type") || undefined;
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
                images: true,
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
            containerImages, userDocuments,
        } = body;

        // Detailed validation with specific error messages
        const errors: string[] = [];

        if (!service) errors.push("Service is required");
        if (!bookingDate) errors.push("Booking date is required");
        if (!fromLocation) errors.push("From location is required");
        if (!toLocation) errors.push("To location is required");
        if (!contactName || !contactName.trim()) errors.push("Contact name is required");
        if (fromLocation && toLocation && fromLocation === toLocation) {
            errors.push("From and To locations cannot be the same");
        }
        if (!items || items.length === 0) errors.push("At least one item is required");

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        // Calculate total from items
        let totalAmount = 0;
        if (items && items.length > 0) {
            totalAmount = items.reduce((sum: number, item: any) => {
                const itemTotal = parseFloat(item.total) || (parseFloat(item.unitPrice) * parseInt(item.quantity)) || 0;
                return sum + itemTotal;
            }, 0);
        }
        const vatAmount = totalAmount * 0.12;
        const grandTotal = totalAmount + vatAmount;

        // Create booking with transaction
        const booking = await prisma.$transaction(async (tx) => {
            const newBooking = await tx.cargoBooking.create({
                data: {
                    invoiceNo,
                    userId: result.user.id,
                    service,
                    cargoSize: cargoSize?.toUpperCase() || "MEDIUM",
                    quantity: quantity ? parseInt(quantity) : null,
                    pallets: pallets ? parseInt(pallets) : null,
                    type: type || "DRY",
                    containerNo: containerNo || null,
                    size: size || null,
                    height: height || null,
                    reeferNo: reeferNo || null,
                    material: material || null,
                    color: color || null,
                    chassisNo: chassisNo || null,
                    temperature: temperature || null,
                    decksNo: decksNo || null,
                    boxContains: boxContains || null,
                    bookingDate: new Date(bookingDate),
                    fromLocation,
                    toLocation,
                    voyageNo: voyageNo || null,
                    contactName: contactName.trim(),
                    contactEmail: contactEmail || result.user.email,
                    contactPhone: contactPhone || "",
                    address: address || "",
                    idType: idType || "Passport",
                    damageFound: damageFound || null,
                    damageLocation: damageLocation || null,
                    deficiencyComment: deficiencyComment || null,
                    paymentStatus: paymentStatus || "UNPAID",
                    totalAmount: grandTotal,
                    remark: remark || null,
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

            // Create container images if provided
            if (containerImages && containerImages.length > 0) {
                await tx.bookingImage.createMany({
                    data: containerImages.map((img: any, index: number) => ({
                        cargoBookingId: newBooking.id,
                        imageUrl: img.url,
                        imageType: "CONTAINER",
                        caption: img.caption || `Container image ${index + 1}`,
                        sortOrder: index,
                    })),
                });
            }

            // Create user document images if provided
            if (userDocuments && userDocuments.length > 0) {
                await tx.bookingImage.createMany({
                    data: userDocuments.map((doc: any, index: number) => ({
                        cargoBookingId: newBooking.id,
                        imageUrl: doc.url,
                        imageType: "USER_DOCUMENT",
                        caption: doc.caption || `${idType || 'Document'} ${index + 1}`,
                        sortOrder: index,
                    })),
                });
            }

            // Create invoice
            await tx.invoice.create({
                data: {
                    invoiceNo,
                    userId: result.user.id,
                    cargoBookingId: newBooking.id,
                    subtotal: totalAmount,
                    vatAmount,
                    totalAmount: grandTotal,
                    paymentStatus: paymentStatus || "UNPAID",
                },
            });

            return newBooking;
        });

        const completeBooking = await prisma.cargoBooking.findUnique({
            where: { id: booking.id },
            include: {
                items: true,
                images: true,
                invoice: true,
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

        return NextResponse.json({
            booking: completeBooking,
            invoiceNo,
            message: "Booking created successfully"
        }, { status: 201 });

    } catch (error: any) {
        console.error("Create cargo booking error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create booking" },
            { status: 500 }
        );
    }
}