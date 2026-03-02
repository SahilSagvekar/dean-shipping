// ============================================
// GET /api/notifications - List user notifications
// POST /api/notifications - Create notification (staff)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";
    const type = searchParams.get("type") || undefined;
    const skip = (page - 1) * limit;

    const where: any = { userId: result.user.id };
    if (unreadOnly) where.isRead = false;
    if (type) where.type = type;

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

    // Get counts by type
    const typeCounts = await prisma.notification.groupBy({
        by: ['type'],
        where: { userId: result.user.id },
        _count: { type: true },
    });

    return NextResponse.json({
        notifications,
        unreadCount,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        typeCounts: typeCounts.reduce((acc: any, c) => {
            acc[c.type] = c._count.type;
            return acc;
        }, {}),
    });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { userId, userIds, title, message, type } = body;

        // Validate required fields
        if (!title || !message) {
            return NextResponse.json(
                { error: "Missing required fields: title, message" },
                { status: 400 }
            );
        }

        // Support both single userId and multiple userIds
        const targetUserIds = userIds || (userId ? [userId] : []);
        
        if (targetUserIds.length === 0) {
            return NextResponse.json(
                { error: "At least one userId is required" },
                { status: 400 }
            );
        }

        // Create notifications for all users
        const notifications = await prisma.notification.createMany({
            data: targetUserIds.map((uid: string) => ({
                userId: uid,
                title,
                message,
                type: type || "system",
            })),
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_NOTIFICATION",
            entity: "notification",
            entityId: "bulk",
            metadata: {
                targetUsers: targetUserIds.length,
                type: type || "system",
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ 
            message: `Notifications created for ${notifications.count} users`,
            count: notifications.count,
        }, { status: 201 });
    } catch (error: any) {
        console.error("Create notification error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create notification" },
            { status: 500 }
        );
    }
}