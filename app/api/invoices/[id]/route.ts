// ============================================
// GET /api/invoices/[id]
// PATCH /api/invoices/[id] - Update payment status
// DELETE /api/invoices/[id]
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

    // Try to find by ID first, then by invoice number
    let invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    mobileNumber: true,
                },
            },
            cargoBooking: {
                include: {
                    items: true,
                    images: true
                },
            },
            passengerBooking: {
                include: {
                    images: true,
                    luggage: true
                },
            },
        },
    });

    // If not found by ID, try invoice number
    if (!invoice) {
        invoice = await prisma.invoice.findFirst({
            where: { invoiceNo: id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        mobileNumber: true,
                    },
                },
                cargoBooking: {
                    include: {
                        items: true,
                        images: true
                    },
                },
                passengerBooking: {
                    include: {
                        images: true,
                        luggage: true
                    },
                },
            },
        });
    }

    if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (result.user.role === "USER" && invoice.userId !== result.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ invoice });
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
        // Find the invoice first
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!existingInvoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        const updateData: any = {};

        if (body.paymentStatus !== undefined) {
            updateData.paymentStatus = body.paymentStatus;
            if (body.paymentStatus === "PAID") {
                updateData.paidAt = new Date();
            } else {
                updateData.paidAt = null;
            }
        }

        if (body.paymentMode !== undefined) {
            updateData.paymentMode = body.paymentMode;
        }

        const invoice = await prisma.$transaction(async (tx) => {
            // Update invoice
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: updateData,
            });

            // Sync payment status to the linked booking
            if (body.paymentStatus) {
                if (updatedInvoice.cargoBookingId) {
                    await tx.cargoBooking.update({
                        where: { id: updatedInvoice.cargoBookingId },
                        data: { paymentStatus: body.paymentStatus },
                    });
                }
                if (updatedInvoice.passengerBookingId) {
                    await tx.passengerBooking.update({
                        where: { id: updatedInvoice.passengerBookingId },
                        data: { paymentStatus: body.paymentStatus },
                    });
                }
            }

            return updatedInvoice;
        });

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_INVOICE_PAYMENT",
            entity: "invoice",
            entityId: id,
            metadata: {
                invoiceNo: invoice.invoiceNo,
                paymentStatus: body.paymentStatus,
                paymentMode: body.paymentMode,
                previousStatus: existingInvoice.paymentStatus
            },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            invoice,
            message: `Invoice ${invoice.invoiceNo} updated successfully`
        });
    } catch (error: any) {
        console.error("Update invoice error:", error);
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
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

    // Only admins can delete invoices
    if (result.user.role !== "ADMIN") {
        return NextResponse.json(
            { error: "Only administrators can delete invoices" },
            { status: 403 }
        );
    }

    try {
        const invoice = await prisma.invoice.delete({
            where: { id },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "DELETE_INVOICE",
            entity: "invoice",
            entityId: id,
            metadata: { invoiceNo: invoice.invoiceNo },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            message: "Invoice deleted successfully",
            invoiceNo: invoice.invoiceNo
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}