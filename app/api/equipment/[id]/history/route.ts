// ============================================
// GET /api/equipment/[id]/history - Get equipment assignment history
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: {
            location: { select: { code: true, name: true } },
        },
    });

    if (!equipment) {
        return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
    }

    const [assignments, total] = await Promise.all([
        prisma.equipmentAssignment.findMany({
            where: { equipmentId: id },
            include: {
                assignedTo: {
                    select: { firstName: true, lastName: true, role: true },
                },
                assignedBy: {
                    select: { firstName: true, lastName: true },
                },
            },
            orderBy: { assignedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.equipmentAssignment.count({ where: { equipmentId: id } }),
    ]);

    return NextResponse.json({
        equipment,
        history: assignments,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}
