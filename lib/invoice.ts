import prisma from "./prisma";

/**
 * Generates the next sequential invoice number using SystemSetting.
 * Template: DSL-YYYY-XXXX (e.g., DSL-2024-0001)
 */
export async function getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const settingKey = `last_invoice_number_${year}`;

    let nextNumber = 1;

    try {
        // Safe check for systemSetting because Prisma client might be stale
        if (!(prisma as any).systemSetting) {
            console.warn("Prisma systemSetting is missing, using timestamp fallback");
            return `DSL-${year}-${Date.now().toString().slice(-4)}`;
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key: settingKey },
            create: {
                key: settingKey,
                value: "0",
                type: "number",
                description: `Last invoice sequence number for ${year}`
            },
            update: {},
        });

        nextNumber = parseInt(setting.value) + 1;

        // Save and increment
        await prisma.systemSetting.update({
            where: { key: settingKey },
            data: { value: nextNumber.toString() }
        });
    } catch (err) {
        console.error("Failed to generate sequential invoice number:", err);
        // Fallback to timestamp to prevent crash
        return `DSL-${year}-${Date.now().toString().slice(-4)}`;
    }

    // Format: DSL-2024-0001
    return `DSL-${year}-${nextNumber.toString().padStart(4, "0")}`;
}


/**
 * Synchronizes an invoice number across all related tables when it is updated.
 * Also handles updating de-normalized invoice numbers in ManifestItem and IncidentReport.
 */
export async function syncInvoiceNumberEverywhere(
    params: {
        cargoBookingId?: string;
        passengerBookingId?: string;
        oldInvoiceNo?: string;
        newInvoiceNo?: string;
    }
) {
    const { cargoBookingId, passengerBookingId, oldInvoiceNo, newInvoiceNo } = params;

    const updates = [];

    // 1. Update Manifest Items
    if (newInvoiceNo) {
        updates.push(prisma.manifestItem.updateMany({
            where: {
                OR: [
                    { cargoBookingId: cargoBookingId || undefined },
                    { passengerBookingId: passengerBookingId || undefined },
                    { invoiceNo: oldInvoiceNo || undefined }
                ].filter(Boolean) as any
            },
            data: { invoiceNo: newInvoiceNo }
        }));
    }

    // 2. Update Incident Reports
    if (newInvoiceNo && oldInvoiceNo) {
        updates.push(prisma.incidentReport.updateMany({
            where: { invoiceNo: oldInvoiceNo },
            data: { invoiceNo: newInvoiceNo }
        }));
    }

    // 3. Update Vehicles Wait List
    if (newInvoiceNo && oldInvoiceNo) {
        updates.push(prisma.vehicle.updateMany({
            where: { invoiceNo: oldInvoiceNo },
            data: { invoiceNo: newInvoiceNo }
        }));
    }

    await Promise.all(updates);
}

