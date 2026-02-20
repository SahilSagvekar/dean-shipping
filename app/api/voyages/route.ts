// ============================================
// GET /api/voyages - List voyages with routes and shipments
// POST /api/voyages - Create new voyage
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    try {
        // Get voyages - use "date" (schema field), "from"/"to" (relation names)
        const voyages = await prisma.voyage.findMany({
            orderBy: { date: "desc" },
            skip,
            take: limit,
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
        });

        // For each voyage, get routes (unique from/to combinations from cargo bookings)
        const voyagesWithRoutes = await Promise.all(
            voyages.map(async (voyage) => {
                // Get all cargo bookings for this voyage (voyageNo is stored as a string on CargoBooking)
                const cargoBookings = await prisma.cargoBooking.findMany({
                    where: { voyageNo: String(voyage.voyageNo) },
                    include: {
                        invoice: {
                            select: {
                                invoiceNo: true,
                                totalAmount: true,   // schema field (not grandTotal)
                                paymentStatus: true,
                                paymentMode: true,
                                updatedAt: true,
                            },
                        },
                        items: true,
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                });

                // Group by route (from -> to) using plain string fields on CargoBooking
                const routeMap: { [key: string]: any } = {};

                cargoBookings.forEach((booking) => {
                    const routeKey = `${booking.fromLocation}-${booking.toLocation}`;

                    if (!routeMap[routeKey]) {
                        routeMap[routeKey] = {
                            id: routeKey,
                            fromLocation: booking.fromLocation,
                            toLocation: booking.toLocation,
                            shipments: [],
                            totalShipments: 0,
                        };
                    }

                    // Build item details from CargoItem.itemType (schema field)
                    const itemDetails = booking.items
                        .map(item => `${item.itemType}${item.quantity > 1 ? ` x ${item.quantity}` : ""}`)
                        .join(", ") || booking.service;

                    routeMap[routeKey].shipments.push({
                        id: booking.id,
                        invoiceNo: booking.invoice?.invoiceNo || booking.invoiceNo,
                        senderName:
                            `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() ||
                            booking.contactName,
                        receiverName: booking.contactName,
                        itemDetails,
                        paymentMode: booking.invoice?.paymentMode || "",
                        amount: booking.invoice?.totalAmount || booking.totalAmount,
                        paymentStatus: booking.invoice?.paymentStatus || booking.paymentStatus,
                        updatedAt: booking.invoice?.updatedAt || booking.updatedAt,
                    });

                    routeMap[routeKey].totalShipments++;
                });

                return {
                    id: voyage.id,
                    voyageNo: voyage.voyageNo,
                    shipName: voyage.shipName,
                    date: voyage.date,           // schema field (not departureDate)
                    status: voyage.status,
                    from: voyage.from,
                    to: voyage.to,
                    routes: Object.values(routeMap),
                };
            })
        );

        const total = await prisma.voyage.count();

        return NextResponse.json({
            voyages: voyagesWithRoutes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Get voyages error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch voyages" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        // Accept both old field names (departureDate / vesselName) and correct schema names (date / shipName)
        const voyageNo = body.voyageNo;
        const shipName = body.shipName || body.vesselName;
        const date = body.date || body.departureDate;
        const fromLocationCode = body.fromLocationCode || body.fromCode;
        const toLocationCode = body.toLocationCode || body.toCode;
        const status = body.status;

        // Validation
        const errors: string[] = [];
        if (!voyageNo) errors.push("Voyage number is required");
        if (!date) errors.push("Date is required");
        if (!shipName) errors.push("Ship name is required");
        if (!fromLocationCode) errors.push("From location is required");
        if (!toLocationCode) errors.push("To location is required");

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        // voyageNo must be an integer (unique Int in schema)
        const voyageNoInt = parseInt(String(voyageNo));
        if (isNaN(voyageNoInt)) {
            return NextResponse.json(
                { error: "Voyage number must be a valid integer" },
                { status: 400 }
            );
        }

        // Check for duplicate voyage number
        const existing = await prisma.voyage.findUnique({
            where: { voyageNo: voyageNoInt },
        });

        if (existing) {
            return NextResponse.json(
                { error: `Voyage ${voyageNoInt} already exists` },
                { status: 400 }
            );
        }

        // Find locations by code
        const fromLocation = await prisma.location.findUnique({
            where: { code: fromLocationCode },
        });
        const toLocation = await prisma.location.findUnique({
            where: { code: toLocationCode },
        });

        if (!fromLocation || !toLocation) {
            return NextResponse.json(
                { error: "Invalid location codes" },
                { status: 400 }
            );
        }

        // Create voyage using correct schema field names: shipName, date, fromId, toId
        const voyage = await prisma.voyage.create({
            data: {
                voyageNo: voyageNoInt,
                shipName: shipName,
                date: new Date(date),
                fromId: fromLocation.id,
                toId: toLocation.id,
                status: status || "SCHEDULED",
            },
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_VOYAGE",
            entity: "voyage",
            entityId: voyage.id,
            metadata: { voyageNo: voyageNoInt },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json(
            {
                voyage,
                message: `Voyage ${voyageNoInt} created successfully`,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create voyage error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create voyage" },
            { status: 500 }
        );
    }
}