// ============================================
// GET /api/manifest - List manifest items (by voyage)
// POST /api/manifest - Add item to manifest
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const voyageId = searchParams.get("voyageId");
    const voyageNo = searchParams.get("voyageNo");
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    if (!voyageId && !voyageNo) {
        return NextResponse.json(
            { error: "Either voyageId or voyageNo is required" },
            { status: 400 }
        );
    }

    const where: any = {};
    
    if (voyageId) {
        where.voyageId = voyageId;
    } else if (voyageNo) {
        where.voyage = { voyageNo: parseInt(voyageNo) };
    }
    
    if (status) where.status = status;

    const [items, total, voyage] = await Promise.all([
        prisma.manifestItem.findMany({
            where,
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
                    select: {
                        id: true,
                        service: true,
                        type: true,
                        paymentStatus: true,
                        items: true,
                    },
                },
                passengerBooking: {
                    select: {
                        id: true,
                        adultCount: true,
                        childCount: true,
                        infantCount: true,
                        paymentStatus: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
            skip,
            take: limit,
        }),
        prisma.manifestItem.count({ where }),
        voyageId
            ? prisma.voyage.findUnique({
                  where: { id: voyageId },
                  include: {
                      from: { select: { code: true, name: true } },
                      to: { select: { code: true, name: true } },
                  },
              })
            : voyageNo
            ? prisma.voyage.findUnique({
                  where: { voyageNo: parseInt(voyageNo) },
                  include: {
                      from: { select: { code: true, name: true } },
                      to: { select: { code: true, name: true } },
                  },
              })
            : null,
    ]);

    // Calculate summary
    const summary = {
        totalItems: total,
        pending: items.filter((i) => i.status === "PENDING").length,
        loaded: items.filter((i) => i.status === "LOADED").length,
        unloaded: items.filter((i) => i.status === "UNLOADED").length,
        delivered: items.filter((i) => i.status === "DELIVERED").length,
        totalAmount: items.reduce((sum, i) => sum + i.amount, 0),
    };

    return NextResponse.json({
        voyage,
        items,
        summary,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const {
            voyageId,
            cargoBookingId,
            passengerBookingId,
            invoiceNo,
            senderName,
            receiverName,
            itemDetails,
            quantity,
            amount,
            notes,
        } = body;

        if (!voyageId || !invoiceNo || !senderName || !itemDetails) {
            return NextResponse.json(
                { error: "Missing required fields: voyageId, invoiceNo, senderName, itemDetails" },
                { status: 400 }
            );
        }

        // Verify voyage exists
        const voyage = await prisma.voyage.findUnique({ where: { id: voyageId } });
        if (!voyage) {
            return NextResponse.json({ error: "Voyage not found" }, { status: 404 });
        }

        const manifestItem = await prisma.manifestItem.create({
            data: {
                voyageId,
                cargoBookingId,
                passengerBookingId,
                invoiceNo,
                senderName,
                receiverName,
                itemDetails,
                quantity: quantity || 1,
                amount: parseFloat(amount) || 0,
                notes,
            },
            include: {
                voyage: { select: { voyageNo: true } },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "ADD_MANIFEST_ITEM",
            entity: "manifest_item",
            entityId: manifestItem.id,
            metadata: { voyageId, invoiceNo },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ manifestItem }, { status: 201 });
    } catch (error: any) {
        console.error("Add manifest item error:", error);
        return NextResponse.json({ error: "Failed to add manifest item" }, { status: 500 });
    }
}
