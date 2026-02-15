// ============================================
// GET /api/admin/audit-logs - View audit logs
// ============================================
// Admin-only endpoint to view system audit logs

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAdmin(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action") || undefined;
    const entity = searchParams.get("entity") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true, role: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.auditLog.count({ where }),
    ]);

    // Get unique actions and entities for filters
    const [actions, entities] = await Promise.all([
        prisma.auditLog.findMany({
            select: { action: true },
            distinct: ["action"],
        }),
        prisma.auditLog.findMany({
            select: { entity: true },
            distinct: ["entity"],
        }),
    ]);

    return NextResponse.json({
        logs,
        filters: {
            actions: actions.map((a) => a.action),
            entities: entities.map((e) => e.entity),
        },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}
