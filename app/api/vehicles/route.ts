// ============================================
// GET /api/vehicles - List vehicle wait list
// POST /api/vehicles - Add vehicle to wait list
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [vehicles, total] = await Promise.all([
        prisma.vehicle.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
        vehicles,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { registrationNo, ownerName, contactNo, vehicleType, fromLocation, toLocation, bookingDate, notes } = body;

        if (!registrationNo || !ownerName || !vehicleType || !fromLocation || !toLocation || !bookingDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                registrationNo,
                ownerName,
                contactNo: contactNo || "",
                vehicleType,
                fromLocation,
                toLocation,
                bookingDate: new Date(bookingDate),
                notes,
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "ADD_VEHICLE",
            entity: "vehicle",
            entityId: vehicle.id,
            metadata: { registrationNo },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ vehicle }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add vehicle" }, { status: 500 });
    }
}
