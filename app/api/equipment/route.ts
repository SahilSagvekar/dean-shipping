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

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (locationCode) where.location = { code: locationCode };

    const equipment = await prisma.equipment.findMany({
        where,
        include: {
            location: { select: { code: true, name: true } },
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Group by type for the frontend
    const grouped = equipment.reduce((acc: any, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {});

    return NextResponse.json({ equipment, grouped });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { type, name, identifier, locationCode } = body;

        if (!type || !name || !locationCode) {
            return NextResponse.json(
                { error: "Missing required fields: type, name, locationCode" },
                { status: 400 }
            );
        }

        // Find or create location
        const location = await prisma.location.upsert({
            where: { code: locationCode },
            create: { code: locationCode, name: locationCode },
            update: {},
        });

        const item = await prisma.equipment.create({
            data: {
                type,
                name,
                identifier,
                locationId: location.id,
            },
            include: {
                location: { select: { code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "ADD_EQUIPMENT",
            entity: "equipment",
            entityId: item.id,
            metadata: { type, name, location: locationCode },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ equipment: item }, { status: 201 });
    } catch (error: any) {
        console.error("Add equipment error:", error);
        return NextResponse.json({ error: "Failed to add equipment" }, { status: 500 });
    }
}
