import prisma from "./prisma";

/**
 * Generates the next sequential invoice number using SystemSetting.
 * Template: DSL-YYYY-XXXX (e.g., DSL-2024-0001)
 *
 * Uses an atomic SQL upsert + increment to prevent race conditions
 * when multiple bookings are created concurrently.
 */
export async function getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const settingKey = `last_invoice_number_${year}`;

    try {
        // Safe check for systemSetting because Prisma client might be stale
        if (!(prisma as any).systemSetting) {
            console.warn("Prisma systemSetting is missing, using timestamp fallback");
            return `DSL-${year}-${Date.now().toString().slice(-4)}`;
        }

        // Atomic upsert + increment in a single SQL statement
        // This prevents race conditions where two concurrent requests
        // could read the same value before either increments it.
        const result = await prisma.$queryRaw<{ value: string }[]>`
            INSERT INTO "SystemSetting" ("id", "key", "value", "type", "description", "updatedAt")
            VALUES (gen_random_uuid(), ${settingKey}, '1', 'number', ${`Last invoice sequence number for ${year}`}, NOW())
            ON CONFLICT ("key")
            DO UPDATE SET
                "value" = (CAST("SystemSetting"."value" AS INTEGER) + 1)::TEXT,
                "updatedAt" = NOW()
            RETURNING "value"
        `;

        const nextNumber = parseInt(result[0].value);

        // Format: DSL-2024-0001
        return `DSL-${year}-${nextNumber.toString().padStart(4, "0")}`;
    } catch (err) {
        console.error("Failed to generate sequential invoice number:", err);
        // Fallback to timestamp to prevent crash
        return `DSL-${year}-${Date.now().toString().slice(-4)}`;
    }
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
