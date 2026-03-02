// ============================================
// GET /api/users/[id] - Get user details
// PATCH /api/users/[id] - Update user
// DELETE /api/users/[id] - Deactivate user
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, requireAuth, createAuditLog, getClientIp, hashPassword } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    // Users can only view their own profile, admins can view anyone
    if (result.user.role !== "ADMIN" && result.user.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
        where: { id },
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
            updatedAt: true,
            _count: {
                select: {
                    cargoBookings: true,
                    passengerBookings: true,
                    invoices: true,
                },
            },
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    // Users can only update their own profile, admins can update anyone
    if (result.user.role !== "ADMIN" && result.user.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ["firstName", "lastName", "email", "avatarUrl"];
    // Admins can also update role and active status
    if (result.user.role === "ADMIN") {
        allowedFields.push("role", "isActive", "agentCode");
    }

    const updateData: any = {};
    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updateData[field] = body[field];
        }
    }

    if (body.password) {
        updateData.password = await hashPassword(body.password);
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_USER",
            entity: "user",
            entityId: id,
            metadata: { updatedFields: Object.keys(updateData) },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ user });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAdmin(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    try {
        // Soft delete - deactivate the user
        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "DEACTIVATE_USER",
            entity: "user",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "User deactivated" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
