// ============================================
// GET /api/auth/me
// ============================================
// Get the currently authenticated user's profile

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const user = await prisma.user.findUnique({
        where: { id: result.user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            countryCode: true,
            mobileNumber: true,
            role: true,
            agentCode: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ user });
}
