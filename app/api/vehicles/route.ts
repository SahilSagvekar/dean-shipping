// ============================================
// GET /api/vehicles - List vehicle wait list
// POST /api/vehicles - Add vehicle to wait list
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";
import { VehicleStatus } from "@prisma/client";

// Generate invoice number for vehicles
function generateInvoiceNo(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status as VehicleStatus;
    if (search) {
        where.OR = [
            { ownerName: { contains: search, mode: "insensitive" } },
            { registrationNo: { contains: search, mode: "insensitive" } },
            { vehicleType: { contains: search, mode: "insensitive" } },
            { invoiceNo: { contains: search, mode: "insensitive" } },
        ];
    }

    const [vehicles, total] = await Promise.all([
        prisma.vehicle.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.vehicle.count({ where }),
    ]);

    // Get counts by status
    const statusCounts = await prisma.vehicle.groupBy({
        by: ['status'],
        _count: { status: true },
    });

    return NextResponse.json({
        vehicles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        statusCounts: statusCounts.reduce((acc: any, c) => {
            acc[c.status] = c._count.status;
            return acc;
        }, {}),
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const {
            registrationNo,
            ownerName,
            ownerEmail,
            contactNo,
            vehicleType,
            fromLocation,
            toLocation,
            bookingDate,
            voyageId,
            notes
        } = body;

        // Validation
        const errors: string[] = [];
        if (!registrationNo || !registrationNo.trim()) errors.push("License plate is required");
        if (!ownerName || !ownerName.trim()) errors.push("Owner name is required");
        if (!vehicleType || !vehicleType.trim()) errors.push("Vehicle type is required");
        if (!fromLocation) errors.push("From location is required");
        if (!toLocation) errors.push("To location is required");
        if (!bookingDate) errors.push("Booking date is required");
        if (fromLocation && toLocation && fromLocation === toLocation) {
            errors.push("From and To locations cannot be the same");
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        // Check for duplicate registration number in pending/active status
        // Use the enum values properly
        const existingVehicle = await prisma.vehicle.findFirst({
            where: {
                registrationNo: registrationNo.trim().toUpperCase(),
                status: {
                    in: [
                        VehicleStatus.PENDING,
                        VehicleStatus.IN_DOCK,
                        VehicleStatus.IN_TRANSIT
                    ]
                },
            },
        });

        if (existingVehicle) {
            return NextResponse.json(
                { error: `Vehicle with registration ${registrationNo} is already in the waitlist` },
                { status: 400 }
            );
        }

        const invoiceNo = generateInvoiceNo();

        const vehicle = await prisma.vehicle.create({
            data: {
                invoiceNo,
                registrationNo: registrationNo.trim().toUpperCase(),
                ownerName: ownerName.trim(),
                ownerEmail: ownerEmail?.trim() || null,
                contactNo: contactNo?.trim() || "",
                vehicleType: vehicleType.trim(),
                fromLocation,
                toLocation,
                bookingDate: new Date(bookingDate),
                voyageId: voyageId || null,
                notes: notes?.trim() || null,
                status: VehicleStatus.PENDING,
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "ADD_VEHICLE",
            entity: "vehicle",
            entityId: vehicle.id,
            metadata: {
                registrationNo: vehicle.registrationNo,
                invoiceNo,
                ownerName: vehicle.ownerName,
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            vehicle,
            message: `Vehicle ${vehicle.registrationNo} added to waitlist`
        }, { status: 201 });
    } catch (error: any) {
        console.error("Add vehicle error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add vehicle" },
            { status: 500 }
        );
    }
}