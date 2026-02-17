// ============================================
// GET /api/equipment - List equipment
// POST /api/equipment - Add equipment
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const locationCode = searchParams.get("location") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (status) where.status = status;
    if (locationCode) {
        where.location = { code: locationCode };
    }

    const equipment = await prisma.equipment.findMany({
        where,
        include: {
            location: { select: { id: true, code: true, name: true } },
            assignments: {
                where: { releasedAt: null },
                take: 1,
                include: {
                    assignedTo: { select: { firstName: true, lastName: true } },
                },
            },
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Group by type for the frontend
    const grouped = equipment.reduce((acc: any, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {});

    // Get counts by type
    const counts = await prisma.equipment.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: { type: true },
    });

    // Get available counts
    const availableCounts = await prisma.equipment.groupBy({
        by: ['type'],
        where: { isActive: true, status: 'AVAILABLE' },
        _count: { type: true },
    });

    return NextResponse.json({ 
        equipment, 
        grouped,
        counts: counts.reduce((acc: any, c) => {
            acc[c.type] = c._count.type;
            return acc;
        }, {}),
        availableCounts: availableCounts.reduce((acc: any, c) => {
            acc[c.type] = c._count.type;
            return acc;
        }, {}),
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { type, name, identifier, locationCode, status } = body;

        // Validation
        const errors: string[] = [];
        if (!type) errors.push("Equipment type is required");
        if (!name || !name.trim()) errors.push("Equipment name is required");
        if (!locationCode) errors.push("Location is required");

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", "), errors },
                { status: 400 }
            );
        }

        // Valid equipment types
        const validTypes = ['FORKLIFT', 'MULE', 'CHASSIS', 'CONTAINER', 'FLAT_RACK'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid equipment type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Find location
        const location = await prisma.location.findUnique({
            where: { code: locationCode },
        });

        if (!location) {
            return NextResponse.json(
                { error: `Location with code '${locationCode}' not found` },
                { status: 404 }
            );
        }

        // Check for duplicate name in same type
        const existing = await prisma.equipment.findFirst({
            where: {
                name: name.trim(),
                type,
                isActive: true,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: `Equipment '${name}' already exists in ${type}` },
                { status: 400 }
            );
        }

        const item = await prisma.equipment.create({
            data: {
                type,
                name: name.trim(),
                identifier: identifier?.trim() || null,
                status: status || 'AVAILABLE',
                locationId: location.id,
            },
            include: {
                location: { select: { id: true, code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "ADD_EQUIPMENT",
            entity: "equipment",
            entityId: item.id,
            metadata: { type, name: item.name, location: locationCode },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            equipment: item,
            message: `${item.name} added successfully`
        }, { status: 201 });
    } catch (error: any) {
        console.error("Add equipment error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add equipment" }, 
            { status: 500 }
        );
    }
}