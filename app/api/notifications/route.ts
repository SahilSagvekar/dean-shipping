// ============================================
// GET /api/notifications - List user notifications
// POST /api/notifications - Create notification (staff)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";
    const skip = (page - 1) * limit;

    const where: any = { userId: result.user.id };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
            where: { userId: result.user.id, isRead: false },
        }),
    ]);

    return NextResponse.json({
        notifications,
        unreadCount,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { userId, title, message, type } = body;

        if (!userId || !title || !message) {
            return NextResponse.json(
                { error: "Missing required fields: userId, title, message" },
                { status: 400 }
            );
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || "system",
            },
        });

        return NextResponse.json({ notification }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
}
