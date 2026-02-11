// ============================================
// GET /api/incidents - List incidents
// POST /api/incidents - Report an incident
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [incidents, total] = await Promise.all([
        prisma.incidentReport.findMany({
            where,
            include: {
                reportedBy: {
                    select: { firstName: true, lastName: true, role: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.incidentReport.count({ where }),
    ]);

    return NextResponse.json({
        incidents,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { title, description, location, severity, images } = body;

        if (!title || !description || !location) {
            return NextResponse.json(
                { error: "Missing required fields: title, description, location" },
                { status: 400 }
            );
        }

        const incident = await prisma.incidentReport.create({
            data: {
                reportedById: result.user.id,
                title,
                description,
                location,
                severity: severity || "MEDIUM",
                images: images || [],
            },
            include: {
                reportedBy: {
                    select: { firstName: true, lastName: true, role: true },
                },
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_INCIDENT",
            entity: "incident_report",
            entityId: incident.id,
            metadata: { title, severity: severity || "MEDIUM" },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ incident }, { status: 201 });
    } catch (error) {
        console.error("Create incident error:", error);
        return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
    }
}
