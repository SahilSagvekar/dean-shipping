// ============================================
// GET /api/bookings/cargo - List cargo bookings
// POST /api/bookings/cargo - Create a cargo booking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";

import { getNextInvoiceNumber } from "@/lib/invoice";
import { sendEmail } from "@/lib/email";
import { getInvoiceEmailTemplate } from "@/lib/email-templates";

// Valid service types

const VALID_SERVICE_TYPES = ['CONTAINER', 'PALLET', 'LUGGAGE', 'BOX', 'ENVELOPE', 'BUNDLE', 'OTHER'] as const;
const VALID_BOX_SUB_TYPES = ['DRY', 'FROZEN', 'COOLER'] as const;
const VALID_CARGO_SIZES = ['SMALL', 'MEDIUM', 'LARGE'] as const;
const VALID_DAMAGE_TYPES = ['BROKEN', 'IMPROPERLY_PACKAGED', 'ITEM_MISSING', 'BENT', 'SCRATCHED', 'DAMAGED', 'WET', 'TORN', 'OTHER'] as const;
const VALID_DAMAGE_LOCATIONS = ['LEFT_UPPER_CORNER', 'RIGHT_UPPER_CORNER', 'LEFT_LOWER_CORNER', 'RIGHT_LOWER_CORNER', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'LEFT_CENTER', 'RIGHT_CENTER', 'FRONT', 'BACK', 'MULTIPLE'] as const;
const VALID_ENVELOPE_TYPES = ['SMALL_BOX', 'ENVELOPE', 'PARCEL'] as const;
const VALID_ITEM_LOCATIONS = ['PALLET', 'CONTAINER', 'DECK'] as const;

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const service = searchParams.get("service") || undefined;
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
    if (service) where.service = service;
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
                invoice: { select: { paymentMode: true, paymentStatus: true } },
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
        const invoiceNo = await getNextInvoiceNumber();


        const {
            // Service type
            service,
            boxSubType,
            cargoSize,

            // Flags
            flags,

            // Common fields
            value,
            price,

            // Container specific
            containerNo,
            chassisNo,
            temperature,
            containerSize,
            containerType,
            contents,

            // Pallet specific
            palletNo,
            reeferNo,
            palletHeight,
            palletType,
            decksNo,

            // Luggage specific
            material,
            color,
            luggageType,

            // Envelope specific
            envelopeType,

            // Bundle specific
            bundleMaterial,
            bundleQuantity,
            bundleLength,
            bundleSize,
            itemLocation,
            itemNumber,

            // Other specific
            itemName,

            // Dates & locations
            bookingDate,
            fromLocation,
            toLocation,
            voyageId,
            voyageNo,

            // Contact details
            contactName,
            contactEmail,
            contactPhone,
            address,
            idType,

            // Deficiency
            damageFound,
            damageLocation,
            deficiencyComment,

            // Additional Services
            hasTape,
            wrapType,
            hasTags,
            insuranceAmount,
            additionalServicePrice,

            // Payment
            paymentStatus,
            remark,

            // Items
            items,

            // Images (URLs after upload)
            containerImages,
            userDocuments,

            // Legacy fields (for backward compatibility)
            quantity,
            pallets,
            type,
            size,
            height,
            boxContains,
        } = body;

        // =========================================
        // VALIDATION
        // =========================================
        const errors: string[] = [];

        // Required fields
        if (!service) {
            errors.push("Service type is required");
        } else if (!VALID_SERVICE_TYPES.includes(service)) {
            errors.push(`Invalid service type. Must be one of: ${VALID_SERVICE_TYPES.join(', ')}`);
        }

        if (!bookingDate) errors.push("Booking date is required");
        if (!fromLocation) errors.push("From location is required");
        if (!toLocation) errors.push("To location is required");
        if (!contactName || !contactName.trim()) errors.push("Contact name is required");

        if (fromLocation && toLocation && fromLocation === toLocation) {
            errors.push("From and To locations cannot be the same");
        }

        if (!items || items.length === 0) {
            errors.push("At least one item is required");
        }

        // Service-specific validation
        if (service === 'BOX' && boxSubType && !VALID_BOX_SUB_TYPES.includes(boxSubType)) {
            errors.push(`Invalid box sub-type. Must be one of: ${VALID_BOX_SUB_TYPES.join(', ')}`);
        }

        if (cargoSize && !VALID_CARGO_SIZES.includes(cargoSize.toUpperCase())) {
            errors.push(`Invalid cargo size. Must be one of: ${VALID_CARGO_SIZES.join(', ')}`);
        }

        if (damageFound && !VALID_DAMAGE_TYPES.includes(damageFound)) {
            errors.push(`Invalid damage type. Must be one of: ${VALID_DAMAGE_TYPES.join(', ')}`);
        }

        if (damageLocation && !VALID_DAMAGE_LOCATIONS.includes(damageLocation)) {
            errors.push(`Invalid damage location. Must be one of: ${VALID_DAMAGE_LOCATIONS.join(', ')}`);
        }

        if (service === 'ENVELOPE' && envelopeType) {
            // Convert frontend format to enum format
            const normalizedEnvelopeType = envelopeType.toUpperCase().replace(' ', '_');
            if (!VALID_ENVELOPE_TYPES.includes(normalizedEnvelopeType as any)) {
                errors.push(`Invalid envelope type. Must be one of: Small Box, Envelope, Parcel`);
            }
        }

        if (service === 'BUNDLE' && itemLocation && !VALID_ITEM_LOCATIONS.includes(itemLocation)) {
            errors.push(`Invalid item location. Must be one of: ${VALID_ITEM_LOCATIONS.join(', ')}`);
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        // =========================================
        // CALCULATE TOTALS
        // =========================================
        let itemsTotal = 0;
        if (items && items.length > 0) {
            itemsTotal = items.reduce((sum: number, item: any) => {
                const itemTotal = parseFloat(item.total) || (parseFloat(item.unitPrice) * parseInt(item.quantity)) || 0;
                return sum + itemTotal;
            }, 0);
        }
        
        // Add additional services to subtotal
        const servicesTotal = parseFloat(additionalServicePrice) || 0;
        const subtotal = itemsTotal + servicesTotal;
        const vatAmount = subtotal * 0.12;
        const grandTotal = subtotal + vatAmount;

        // =========================================
        // NORMALIZE DATA
        // =========================================

        // Normalize envelope type from frontend format
        let normalizedEnvelopeType = null;
        if (service === 'ENVELOPE' && envelopeType) {
            normalizedEnvelopeType = envelopeType.toUpperCase().replace(' ', '_');
        }

        // Extract flags
        const isFragile = flags?.fragile || false;
        const isHazardous = flags?.hazardous || false;
        const isLive = flags?.live || false;

        // =========================================
        // CREATE BOOKING
        // =========================================
        const booking = await prisma.$transaction(async (tx) => {
            const newBooking = await tx.cargoBooking.create({
                data: {
                    invoiceNo,
                    userId: result.user.id,
                    voyageId: voyageId || null,

                    // Service type
                    service: service as any,
                    ...(service === 'BOX' ? { boxSubType: (boxSubType?.toUpperCase() as any || 'DRY') } : {}),
                    cargoSize: (cargoSize?.toUpperCase() || "MEDIUM") as any,





                    // Flags
                    isFragile,
                    isHazardous,
                    isLive,

                    // Common fields
                    value: value || null,
                    price: price || null,

                    // Container specific
                    containerNo: ['CONTAINER', 'PALLET'].includes(service) ? (containerNo || null) : null,
                    chassisNo: service === 'CONTAINER' ? (chassisNo || null) : null,
                    temperature: service === 'CONTAINER' ? (temperature || null) : null,
                    containerSize: service === 'CONTAINER' ? (containerSize || null) : null,
                    containerType: service === 'CONTAINER' ? (containerType || null) : null,
                    contents: service === 'CONTAINER' ? (contents || null) : null,

                    // Pallet specific
                    palletNo: ['PALLET', 'BOX'].includes(service) ? (palletNo || null) : null,
                    reeferNo: service === 'PALLET' ? (reeferNo || null) : null,
                    palletHeight: service === 'PALLET' ? (palletHeight || null) : null,
                    palletType: service === 'PALLET' ? (palletType || null) : null,
                    deckNo: ['PALLET', 'BUNDLE'].includes(service) ? (decksNo || null) : null,

                    // Luggage specific
                    material: ['LUGGAGE', 'BUNDLE'].includes(service) ? (material || null) : null,
                    color: service === 'LUGGAGE' ? (color || null) : null,
                    luggageType: service === 'LUGGAGE' ? (luggageType || null) : null,

                    // Envelope specific
                    envelopeType: normalizedEnvelopeType,

                    // Bundle specific
                    bundleMaterial: service === 'BUNDLE' ? (bundleMaterial || material || null) : null,
                    bundleQuantity: service === 'BUNDLE' ? (bundleQuantity || null) : null,
                    bundleLength: service === 'BUNDLE' ? (bundleLength || null) : null,
                    bundleSize: service === 'BUNDLE' ? (bundleSize || null) : null,
                    itemLocation: service === 'BUNDLE' && itemLocation ? itemLocation : null,
                    itemNumber: service === 'BUNDLE' ? (itemNumber || null) : null,

                    // Other specific
                    itemName: service === 'OTHER' ? (itemName || null) : null,

                    // Legacy fields (for backward compatibility)
                    quantity: quantity ? parseInt(quantity) : null,
                    pallets: pallets ? parseInt(pallets) : null,
                    type: type || "DRY",
                    size: size || containerSize || null,
                    height: height || palletHeight || null,
                    boxContains: boxContains || contents || null,

                    // Dates & locations
                    bookingDate: new Date(bookingDate),
                    fromLocation,
                    toLocation,
                    voyageNo: voyageNo || null,

                    // Contact details
                    contactName: contactName.trim(),
                    contactEmail: contactEmail || result.user.email,
                    contactPhone: contactPhone || "",
                    address: address || "",
                    idType: idType || "Passport",

                    // Deficiency
                    damageFound: damageFound || null,
                    damageLocation: damageLocation || null,
                    deficiencyComment: deficiencyComment || null,

                    // Additional Services
                    hasTape: hasTape || false,
                    wrapType: wrapType || null,
                    hasTags: hasTags || false,
                    insuranceAmount: insuranceAmount ? parseFloat(insuranceAmount) : null,
                    additionalServicePrice: parseFloat(additionalServicePrice) || 0,

                    // Payment
                    paymentStatus: paymentStatus || "UNPAID",
                    totalAmount: grandTotal,
                    vatAmount,
                    subtotal: subtotal,
                    remark: remark || null,

                    // Items
                    items: {
                        create: (items || []).map((item: any) => ({
                            itemType: item.itemType || item.type,
                            unitPrice: parseFloat(item.unitPrice) || 0,
                            quantity: parseInt(item.quantity) || 1,
                            total: parseFloat(item.total) || 0,
                            isPaid: item.isPaid || false,
                        })),
                    },
                } as any,
                include: { items: true },

            });

            // Create container images if provided (with URLs)
            if (containerImages && containerImages.length > 0) {
                const validImages = containerImages.filter((img: any) => img.url);
                if (validImages.length > 0) {
                    await tx.bookingImage.createMany({
                        data: validImages.map((img: any, index: number) => ({
                            cargoBookingId: newBooking.id,
                            imageUrl: img.url,
                            imageType: "CONTAINER",
                            caption: img.caption || `Container image ${index + 1}`,
                            sortOrder: index,
                        })),
                    });
                }
            }

            // Create user document images if provided (with URLs)
            if (userDocuments && userDocuments.length > 0) {
                const validDocs = userDocuments.filter((doc: any) => doc.url);
                if (validDocs.length > 0) {
                    await tx.bookingImage.createMany({
                        data: validDocs.map((doc: any, index: number) => ({
                            cargoBookingId: newBooking.id,
                            imageUrl: doc.url,
                            imageType: "USER_DOCUMENT",
                            caption: doc.caption || `${idType || 'Document'} ${index + 1}`,
                            sortOrder: index,
                        })),
                    });
                }
            }

            // Create invoice
            await tx.invoice.create({
                data: {
                    invoiceNo,
                    userId: result.user.id,
                    cargoBookingId: newBooking.id,
                    subtotal: subtotal,
                    vatAmount,
                    totalAmount: grandTotal,
                    paymentStatus: (paymentStatus || "UNPAID") as any,

                },
            });

            return newBooking;
        });

        // Fetch complete booking with relations
        const completeBooking = await prisma.cargoBooking.findUnique({
            where: { id: booking.id },
            include: {
                items: true,
                images: true,
                invoice: true,
            },
        });

        // Create audit log
        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_CARGO_BOOKING",
            entity: "cargo_booking",
            entityId: booking.id,
            metadata: {
                invoiceNo,
                service,
                boxSubType: service === 'BOX' ? boxSubType : null,
                fromLocation,
                toLocation,
                totalAmount: grandTotal,
                itemCount: items?.length || 0,
            },
            ipAddress: getClientIp(request),
        });

        // Send Invoice Email
        if (completeBooking) {
            try {
                const bookingType = 'Cargo Booking';
                const invoiceItems = completeBooking.items.map((item: any) => ({
                    description: item.itemType,
                    quantity: item.quantity,
                    total: item.total
                }));

                const emailData = {
                    invoiceNo,
                    customerName: contactName,
                    totalAmount: grandTotal,
                    subtotal: subtotal,
                    vatAmount,
                    items: invoiceItems,
                    fromLocation,
                    toLocation,
                    bookingType
                };

                const { subject, html } = getInvoiceEmailTemplate(emailData);
                
                // Send email asynchronously
                sendEmail({
                    to: contactEmail || result.user.email,
                    subject,
                    html
                });
            } catch (emailError) {
                console.error("Failed to send booking email:", emailError);
            }
        }

        return NextResponse.json({
            booking: completeBooking,
            invoiceNo,
            message: "Booking created successfully"
        }, { status: 201 });

    } catch (error: any) {
        console.error("Create cargo booking error:", error);

        // Handle Prisma-specific errors
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A booking with this invoice number already exists" },
                { status: 409 }
            );
        }

        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: "Invalid reference: User or Voyage not found" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create booking. Please try again." },
            { status: 500 }
        );
    }
}