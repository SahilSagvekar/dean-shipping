// ============================================
// GET /api/prices/[id] - Get price details
// PATCH /api/prices/[id] - Update price
// DELETE /api/prices/[id] - Delete price (soft)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const price = await prisma.price.findUnique({
        where: { id },
        include: {
            from: { select: { code: true, name: true } },
            to: { select: { code: true, name: true } },
        },
    });

    if (!price) {
        return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    return NextResponse.json({ price });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();

    try {
        const updateData: any = {};
        if (body.size !== undefined) updateData.size = body.size;
        if (body.value !== undefined) updateData.value = parseFloat(body.value);
        if (body.type !== undefined) updateData.type = body.type;

        // Handle location updates
        if (body.fromCode) {
            const from = await prisma.location.upsert({
                where: { code: body.fromCode },
                create: { code: body.fromCode, name: body.fromCode },
                update: {},
            });
            updateData.fromId = from.id;
        }
        if (body.toCode) {
            const to = await prisma.location.upsert({
                where: { code: body.toCode },
                create: { code: body.toCode, name: body.toCode },
                update: {},
            });
            updateData.toId = to.id;
        }

        const price = await prisma.price.update({
            where: { id },
            data: updateData,
            include: {
                from: { select: { code: true, name: true } },
                to: { select: { code: true, name: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_PRICE",
            entity: "price",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ price });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Price not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    try {
        // Soft delete
        await prisma.price.update({
            where: { id },
            data: { isActive: false },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_PRICE",
            entity: "price",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Price deleted" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Price not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
