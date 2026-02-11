// ============================================
// GET /api/locations - List all locations
// POST /api/locations - Create a location
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function GET() {
    const locations = await prisma.location.findMany({
        where: { isActive: true },
        orderBy: { code: "asc" },
        select: {
            id: true,
            code: true,
            name: true,
            _count: {
                select: { equipmentAt: true },
            },
        },
    });

    return NextResponse.json({ locations });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const body = await request.json();
    const { code, name } = body;

    if (!code || !name) {
        return NextResponse.json(
            { error: "Missing required fields: code, name" },
            { status: 400 }
        );
    }

    try {
        const location = await prisma.location.create({
            data: { code: code.toUpperCase(), name },
        });

        return NextResponse.json({ location }, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Location code already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
    }
}
