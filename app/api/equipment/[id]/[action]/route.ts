// ============================================
// POST /api/equipment/[id]/assign - Assign equipment to user
// POST /api/equipment/[id]/release - Release equipment
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;
    const url = new URL(request.url);
    const action = url.pathname.split("/").pop(); // "assign" or "release"

    try {
        const equipment = await prisma.equipment.findUnique({
            where: { id },
            include: {
                assignments: {
                    where: { releasedAt: null },
                    orderBy: { assignedAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!equipment) {
            return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
        }

        if (action === "assign") {
            const body = await request.json();
            const { assignToUserId, voyageId, cargoBookingId, expectedReturn, notes } = body;

            if (!assignToUserId) {
                return NextResponse.json(
                    { error: "assignToUserId is required" },
                    { status: 400 }
                );
            }

            if (equipment.status === "OCCUPIED") {
                return NextResponse.json(
                    { error: "Equipment is already occupied" },
                    { status: 400 }
                );
            }

            if (equipment.status === "MAINTENANCE") {
                return NextResponse.json(
                    { error: "Equipment is under maintenance" },
                    { status: 400 }
                );
            }

            // Verify user exists
            const user = await prisma.user.findUnique({ where: { id: assignToUserId } });
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Create assignment and update status
            const [assignment, updatedEquipment] = await prisma.$transaction([
                prisma.equipmentAssignment.create({
                    data: {
                        equipmentId: id,
                        assignedToId: assignToUserId,
                        assignedById: result.user.id,
                        voyageId,
                        cargoBookingId,
                        expectedReturn: expectedReturn ? new Date(expectedReturn) : undefined,
                        notes,
                    },
                    include: {
                        assignedTo: { select: { firstName: true, lastName: true } },
                    },
                }),
                prisma.equipment.update({
                    where: { id },
                    data: { status: "OCCUPIED" },
                }),
            ]);

            await createAuditLog({
                userId: result.user.id,
                action: "ASSIGN_EQUIPMENT",
                entity: "equipment",
                entityId: id,
                metadata: {
                    assignedTo: assignToUserId,
                    voyageId,
                },
                ipAddress: getClientIp(request),
            });

            return NextResponse.json({
                message: "Equipment assigned successfully",
                assignment,
                equipment: updatedEquipment,
            });

        } else if (action === "release") {
            if (equipment.status !== "OCCUPIED") {
                return NextResponse.json(
                    { error: "Equipment is not currently assigned" },
                    { status: 400 }
                );
            }

            const currentAssignment = equipment.assignments[0];
            if (!currentAssignment) {
                return NextResponse.json(
                    { error: "No active assignment found" },
                    { status: 400 }
                );
            }

            // Release assignment and update status
            const [releasedAssignment, updatedEquipment] = await prisma.$transaction([
                prisma.equipmentAssignment.update({
                    where: { id: currentAssignment.id },
                    data: { releasedAt: new Date() },
                }),
                prisma.equipment.update({
                    where: { id },
                    data: { status: "AVAILABLE" },
                }),
            ]);

            await createAuditLog({
                userId: result.user.id,
                action: "RELEASE_EQUIPMENT",
                entity: "equipment",
                entityId: id,
                metadata: {
                    assignmentId: currentAssignment.id,
                    releasedFrom: currentAssignment.assignedToId,
                },
                ipAddress: getClientIp(request),
            });

            return NextResponse.json({
                message: "Equipment released successfully",
                assignment: releasedAssignment,
                equipment: updatedEquipment,
            });

        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error(`Equipment ${action} error:`, error);
        return NextResponse.json({ error: `Failed to ${action} equipment` }, { status: 500 });
    }
}
