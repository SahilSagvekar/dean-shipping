// ============================================
// GET /api/incidents - List incidents
// POST /api/incidents - Report an incident
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, createAuditLog, getClientIp } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const severity = searchParams.get("severity") || undefined;
    const incidentType = searchParams.get("type") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (incidentType) where.incidentType = incidentType;

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
        const {
            incidentType,
            title,
            description,
            location,
            invoiceNo,
            date,
            time,
            insuranceTaken,
            shipmentDetails,
            severity,
            images,
        } = body;

        if (!incidentType || !title || !description || !location) {
            return NextResponse.json(
                { error: "Missing required fields: incidentType, title, description, location" },
                { status: 400 }
            );
        }

        const incident = await prisma.incidentReport.create({
            data: {
                reportedById: result.user.id,
                incidentType,
                title,
                description,
                location,
                invoiceNo,
                date: date ? new Date(date) : new Date(),
                time,
                insuranceTaken: insuranceTaken || false,
                shipmentDetails,
                severity: severity || "MEDIUM",
                images: images || [],
            },
            include: {
                reportedBy: {
                    select: { firstName: true, lastName: true, role: true, email: true },
                },
            },
        });

        // Send Email Notification to Admin
        const adminEmail = process.env.ADMIN_EMAIL || "admin@deansshipping.com";
        const severityColor = 
            severity === 'CRITICAL' ? '#ef4444' : 
            severity === 'HIGH' ? '#f97316' : 
            severity === 'MEDIUM' ? '#eab308' : '#22c55e';

        await sendEmail({
            to: adminEmail,
            subject: `🚨 [DEAN'S] New Incident Reported: ${title} (${severity})`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #111827; margin-bottom: 4px;">New Incident Report</h2>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 0;">#${incident.id}</p>
                    
                    <div style="margin: 20px 0; padding: 12px; background-color: ${severityColor}15; border-left: 4px solid ${severityColor};">
                        <strong style="color: ${severityColor}; font-size: 20px;">${title}</strong>
                        <p style="margin: 4px 0; color: #374151;">Type: <strong>${incidentType}</strong> | Severity: <strong>${severity}</strong></p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 120px;">Location:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${location}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Date/Time:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${new Date(incident.date).toLocaleDateString()} at ${time || 'unspecified'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Reported By:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${incident.reportedBy.firstName} ${incident.reportedBy.lastName} (${incident.reportedBy.role})</td>
                        </tr>
                        ${invoiceNo ? `
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Invoice No:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">#${invoiceNo}</td>
                        </tr>` : ''}
                    </table>

                    <div style="margin-bottom: 24px;">
                        <h4 style="color: #374151; margin-bottom: 8px;">Description:</h4>
                        <p style="color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${description}</p>
                    </div>

                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/incidents/${incident.id}" 
                       style="display: inline-block; background-color: #111827; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                       View on Dashboard
                    </a>
                    
                    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
                        This is an automated notification from Dean's Shipping Cargo Management System.
                    </footer>
                </div>
            `
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_INCIDENT",
            entity: "incident_report",
            entityId: incident.id,
            metadata: { incidentType, title, severity: severity || "MEDIUM" },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ incident }, { status: 201 });
    } catch (error) {
        console.error("Create incident error:", error);
        return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
    }
}