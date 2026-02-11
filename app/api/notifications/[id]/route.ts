// ============================================
// PATCH /api/notifications/[id] - Mark as read
// DELETE /api/notifications/[id] - Delete notification
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    // Handle "mark-all-read" special ID
    if (id === "mark-all-read") {
        await prisma.notification.updateMany({
            where: { userId: result.user.id, isRead: false },
            data: { isRead: true },
        });
        return NextResponse.json({ message: "All notifications marked as read" });
    }

    try {
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== result.user.id) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json({ message: "Marked as read" });
    } catch {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    try {
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== result.user.id) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        await prisma.notification.delete({ where: { id } });

        return NextResponse.json({ message: "Notification deleted" });
    } catch {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
