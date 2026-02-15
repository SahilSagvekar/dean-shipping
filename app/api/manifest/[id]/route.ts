// ============================================
// GET /api/manifest/[id] - Get manifest item
// PATCH /api/manifest/[id] - Update manifest item status
// DELETE /api/manifest/[id] - Remove from manifest
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    const manifestItem = await prisma.manifestItem.findUnique({
        where: { id },
        include: {
            voyage: {
                select: {
                    voyageNo: true,
                    shipName: true,
                    date: true,
                    from: { select: { code: true, name: true } },
                    to: { select: { code: true, name: true } },
                },
            },
            cargoBooking: {
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                    items: true,
                    images: true,
                },
            },
            passengerBooking: {
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                },
            },
        },
    });

    if (!manifestItem) {
        return NextResponse.json({ error: "Manifest item not found" }, { status: 404 });
    }

    return NextResponse.json({ manifestItem });
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
        const allowedFields = [
            "status", "senderName", "receiverName", "itemDetails",
            "quantity", "amount", "notes"
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === "quantity") {
                    updateData[field] = parseInt(body[field]);
                } else if (field === "amount") {
                    updateData[field] = parseFloat(body[field]);
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        // Handle status timestamps
        if (body.status === "LOADED" && !body.loadedAt) {
            updateData.loadedAt = new Date();
        }
        if (body.status === "UNLOADED" && !body.unloadedAt) {
            updateData.unloadedAt = new Date();
        }

        const manifestItem = await prisma.manifestItem.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_MANIFEST_ITEM",
            entity: "manifest_item",
            entityId: id,
            metadata: { status: body.status },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ manifestItem });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Manifest item not found" }, { status: 404 });
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
        await prisma.manifestItem.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_MANIFEST_ITEM",
            entity: "manifest_item",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Manifest item removed" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Manifest item not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
