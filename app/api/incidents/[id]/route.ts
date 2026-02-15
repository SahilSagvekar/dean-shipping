// ============================================
// GET /api/incidents/[id] - Get incident details
// PATCH /api/incidents/[id] - Update incident status
// DELETE /api/incidents/[id] - Close/delete incident
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    const incident = await prisma.incidentReport.findUnique({
        where: { id },
        include: {
            reportedBy: {
                select: { firstName: true, lastName: true, role: true, email: true },
            },
        },
    });

    if (!incident) {
        return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const body = await request.json();

    try {
        const updateData: any = {};
        const fields = [
            "incidentType", "title", "description", "location", "invoiceNo",
            "date", "time", "insuranceTaken", "shipmentDetails",
            "severity", "status", "images", "resolution"
        ];
        
        for (const field of fields) {
            if (body[field] !== undefined) {
                if (field === "date") {
                    updateData[field] = new Date(body[field]);
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        // If status is being set to RESOLVED, set resolvedAt and resolvedBy
        if (body.status === "RESOLVED" || body.status === "CLOSED") {
            updateData.resolvedAt = new Date();
            updateData.resolvedBy = result.user.id;
        }

        const incident = await prisma.incidentReport.update({
            where: { id },
            data: updateData,
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_INCIDENT",
            entity: "incident_report",
            entityId: id,
            metadata: { status: body.status },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ incident });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    try {
        await prisma.incidentReport.delete({ where: { id } });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_INCIDENT",
            entity: "incident_report",
            entityId: id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Incident deleted" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}