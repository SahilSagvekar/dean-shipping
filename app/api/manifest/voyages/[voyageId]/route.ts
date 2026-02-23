// ============================================
// GET /api/manifest/voyages/[voyageId]
// ============================================
// Returns a single voyage's full cargo-booking data,
// split into three groups: dry / frozen / cooler.
// Each booking includes the same fields shown on the
// dashboard shipment tables (invoice, sender, receiver,
// item details, payment mode, amount, status, updatedAt).
//
// Query params:
//   paymentStatus  PAID | UNPAID | PARTIAL  (optional filter)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ voyageId: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { voyageId } = await params;
    const { searchParams } = new URL(request.url);
    const paymentStatusFilter = searchParams.get("paymentStatus") as
        | "PAID"
        | "UNPAID"
        | "PARTIAL"
        | null;

    try {
        const voyage = await prisma.voyage.findUnique({
            where: { id: voyageId },
            include: {
                from: { select: { code: true, name: true } },
                to:   { select: { code: true, name: true } },
                cargoBookings: {
                    where: paymentStatusFilter
                        ? { paymentStatus: paymentStatusFilter }
                        : undefined,
                    include: {
                        // Sender name comes from the user who created the booking
                        user: {
                            select: { firstName: true, lastName: true },
                        },
                        // Item details (type labels + quantities)
                        items: {
                            select: {
                                itemType:  true,
                                quantity:  true,
                                total:     true,
                            },
                        },
                        // Payment mode lives on the linked invoice
                        invoice: {
                            select: {
                                paymentMode:   true,
                                paymentStatus: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!voyage) {
            return NextResponse.json(
                { error: "Voyage not found" },
                { status: 404 }
            );
        }

        const all    = voyage.cargoBookings;
        const dry    = all.filter((b) => b.type === "DRY");
        const frozen = all.filter((b) => b.type === "FROZEN");
        const cooler = all.filter((b) => b.type === "COOLER");

        const totalAmount = all.reduce((sum, b) => sum + b.totalAmount, 0);
        const paidAmount  = all
            .filter((b) => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.totalAmount, 0);

        return NextResponse.json({
            voyage: {
                id:       voyage.id,
                voyageNo: voyage.voyageNo,
                shipName: voyage.shipName,
                date:     voyage.date,
                status:   voyage.status,
                from:     voyage.from,
                to:       voyage.to,
            },
            bookings: {
                dry,
                frozen,
                cooler,
            },
            summary: {
                totalBookings: all.length,
                dry:           dry.length,
                frozen:        frozen.length,
                cooler:        cooler.length,
                totalAmount,
                paidAmount,
                unpaidAmount: totalAmount - paidAmount,
            },
        });
    } catch (error) {
        console.error("Manifest voyage detail error:", error);
        return NextResponse.json(
            { error: "Failed to fetch voyage details" },
            { status: 500 }
        );
    }
}
