// ============================================
// GET /api/bookings/passenger - List passenger bookings
// POST /api/bookings/passenger - Create a passenger booking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";

import { getNextInvoiceNumber } from "@/lib/invoice";
import { sendEmail } from "@/lib/email";
import { getInvoiceEmailTemplate } from "@/lib/email-templates";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const search = searchParams.get("search") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (result.user.role === "USER") {
        where.userId = result.user.id;
    }
    if (status) where.paymentStatus = status;
    if (from) where.fromLocation = from;
    if (to) where.toLocation = to;
    
    // Search by name, email, or invoice number
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { invoiceNo: { contains: search, mode: "insensitive" } },
            { contact: { contains: search, mode: "insensitive" } },
        ];
    }

    const [bookings, total] = await Promise.all([
        prisma.passengerBooking.findMany({
            where,
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                images: true,
                luggage: true,
                invoice: true,
                _count: { select: { images: true, luggage: true } },
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
        const invoiceNo = await getNextInvoiceNumber();


        const {
            infantCount,
            childCount,
            adultCount,
            name,
            email,
            contact,
            bookingDate,
            fromLocation,
            toLocation,
            voyageId,
            idType,
            paymentStatus,
            remark,
            totalAmount,
            luggage,
        } = body;

        // Validation
        const errors: string[] = [];

        if (!name || !name.trim()) errors.push("Name is required");
        if (!bookingDate) errors.push("Booking date is required");
        if (!fromLocation) errors.push("Departure location is required");
        if (!toLocation) errors.push("Destination is required");
        if (fromLocation && toLocation && fromLocation === toLocation) {
            errors.push("Departure and destination cannot be the same");
        }

        const infants = parseInt(infantCount) || 0;
        const children = parseInt(childCount) || 0;
        const adults = parseInt(adultCount) || 0;
        const totalPassengers = infants + children + adults;

        if (totalPassengers === 0) {
            errors.push("At least one passenger is required");
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        const amount = parseFloat(totalAmount) || 0;
        const vatAmount = amount * 0.12;
        const grandTotal = amount + vatAmount;

        // Create booking with transaction
        const booking = await prisma.$transaction(async (tx) => {
            const newBooking = await tx.passengerBooking.create({
                data: {
                    invoiceNo,
                    userId: result.user.id,
                    voyageId: voyageId || null,
                    infantCount: infants,
                    childCount: children,
                    adultCount: adults,
                    name: name.trim(),
                    email: email || result.user.email,
                    contact: contact || "",
                    bookingDate: new Date(bookingDate),
                    fromLocation,
                    toLocation,
                    idType: idType || "Passport",
                    paymentStatus: (paymentStatus || "UNPAID") as any,

                    totalAmount: grandTotal,
                    remark: remark || null,
                    // Create luggage items if provided
                    ...(luggage && luggage.length > 0
                        ? {
                            luggage: {
                                create: luggage.map((item: any) => ({
                                    type: item.type,
                                    weight: parseFloat(item.weight) || 0,
                                    quantity: parseInt(item.quantity) || 1,
                                    price: parseFloat(item.price) || 0,
                                })),
                            },
                        }
                        : {}),
                },
                include: {
                    luggage: true,
                },
            });

            // Create invoice
            await tx.invoice.create({
                data: {
                    invoiceNo,
                    userId: result.user.id,
                    passengerBookingId: newBooking.id,
                    subtotal: amount,
                    vatAmount,
                    totalAmount: grandTotal,
                    paymentStatus: (paymentStatus || "UNPAID") as any,

                },
            });

            return newBooking;
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_PASSENGER_BOOKING",
            entity: "passenger_booking",
            entityId: booking.id,
            metadata: {
                invoiceNo,
                passengers: totalPassengers,
                fromLocation,
                toLocation,
                totalAmount: grandTotal,
            },
            ipAddress: getClientIp(request),
        });

        // Send Invoice Email
        try {
            const bookingType = 'Passenger Booking';
            const invoiceItems = [];
            // Calculate per-passenger prices from the total
            // The client sends pre-VAT subtotal in totalAmount, which includes passenger + luggage
            const luggageSubtotal = (luggage || []).reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0);
            const passengerSubtotal = amount - luggageSubtotal;
            const totalPax = adults + children + infants;
            
            // Try to get per-type breakdown from DB prices
            let adultPrice = 0;
            let childPrice = 0;
            let infantPrice = 0;
            try {
              const dbPrices = await prisma.price.findMany({
                where: {
                  category: 'PASSENGER',
                  isActive: true,
                  from: { code: fromLocation },
                  to: { code: toLocation },
                },
              });
              dbPrices.forEach((p: any) => {
                const sizeKey = p.size?.toLowerCase();
                if (sizeKey === 'adult') adultPrice = p.value;
                else if (sizeKey === 'child') childPrice = p.value;
                else if (sizeKey === 'infant') infantPrice = p.value;
              });
            } catch (e) {
              // Fallback: estimate from submitted total
              if (adults > 0 && totalPax > 0) {
                adultPrice = passengerSubtotal / totalPax;
                childPrice = adultPrice * 0.7;
                infantPrice = 0;
              }
            }
            
            if (adults > 0) invoiceItems.push({ description: 'Adult Passenger', quantity: adults, total: adults * adultPrice });
            if (children > 0) invoiceItems.push({ description: 'Child Passenger', quantity: children, total: children * childPrice });
            if (infants > 0) invoiceItems.push({ description: 'Infant Passenger', quantity: infants, total: infants * infantPrice });

            const emailData = {
                invoiceNo,
                customerName: name,
                totalAmount: grandTotal,
                subtotal: amount,
                vatAmount,
                items: invoiceItems,
                fromLocation,
                toLocation,
                bookingType
            };

            const { subject, html } = getInvoiceEmailTemplate(emailData);
            
            // Send email asynchronously
            sendEmail({
                to: email || result.user.email,
                subject,
                html
            });
        } catch (emailError) {
            console.error("Failed to send booking email:", emailError);
        }

        return NextResponse.json(
            {
                booking,
                invoiceNo,
                message: "Booking created successfully",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create passenger booking error:", error?.code || error?.message);
        return NextResponse.json(
            { error: "Failed to create booking. Please try again." },
            { status: 500 }
        );
    }
}