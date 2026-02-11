// ============================================
// GET /api/prices - List prices by category
// POST /api/prices - Create a new price entry
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const fromCode = searchParams.get("from") || undefined;
    const toCode = searchParams.get("to") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (fromCode) where.from = { code: fromCode };
    if (toCode) where.to = { code: toCode };

    const [prices, total] = await Promise.all([
        prisma.price.findMany({
            where,
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.price.count({ where }),
    ]);

    return NextResponse.json({
        prices,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { category, size, type, value, fromCode, toCode } = body;

        if (!category || !size || !value || !fromCode || !toCode) {
            return NextResponse.json(
                { error: "Missing required fields: category, size, value, fromCode, toCode" },
                { status: 400 }
            );
        }

        // Find or create locations
        const [fromLocation, toLocation] = await Promise.all([
            prisma.location.upsert({
                where: { code: fromCode },
                create: { code: fromCode, name: fromCode },
                update: {},
            }),
            prisma.location.upsert({
                where: { code: toCode },
                create: { code: toCode, name: toCode },
                update: {},
            }),
        ]);

        const price = await prisma.price.create({
            data: {
                category,
                size,
                type: type || undefined,
                value: parseFloat(value),
                fromId: fromLocation.id,
                toId: toLocation.id,
            },
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_PRICE",
            entity: "price",
            entityId: price.id,
            metadata: { category, size, value, from: fromCode, to: toCode },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ price }, { status: 201 });
    } catch (error: any) {
        console.error("Create price error:", error);
        return NextResponse.json({ error: "Failed to create price" }, { status: 500 });
    }
}
