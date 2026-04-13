// ============================================
// BOOKING VALIDATION SCHEMAS
// ============================================

import { z } from "zod";

// ============================================
// SHARED ENUMS & TYPES
// ============================================

const ServiceType = z.enum(["CONTAINER", "PALLET", "LUGGAGE", "BOX", "ENVELOPE", "BUNDLE", "OTHER"]);
const BoxSubType = z.enum(["DRY", "FROZEN", "COOLER"]);
const CargoSize = z.enum(["SMALL", "MEDIUM", "LARGE"]);
const PaymentStatus = z.enum(["PAID", "UNPAID", "PARTIAL"]);
const DamageType = z.enum([
    "BROKEN", "IMPROPERLY_PACKAGED", "ITEM_MISSING", "BENT",
    "SCRATCHED", "DAMAGED", "WET", "TORN", "OTHER",
]);
const DamageLocation = z.enum([
    "LEFT_UPPER_CORNER", "RIGHT_UPPER_CORNER", "LEFT_LOWER_CORNER", "RIGHT_LOWER_CORNER",
    "TOP", "BOTTOM", "LEFT", "RIGHT", "LEFT_CENTER", "RIGHT_CENTER",
    "FRONT", "BACK", "MULTIPLE",
]);
const EnvelopeType = z.enum(["SMALL_BOX", "ENVELOPE", "PARCEL"]);
const ItemLocation = z.enum(["PALLET", "CONTAINER", "DECK"]);

// ============================================
// CARGO BOOKING
// ============================================

const cargoItemSchema = z.object({
    itemType: z.string().max(200).optional(),
    type: z.string().max(200).optional(),
    unitPrice: z.union([z.number(), z.string()]).transform((v) => parseFloat(String(v)) || 0),
    quantity: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v)) || 1),
    total: z.union([z.number(), z.string()]).transform((v) => parseFloat(String(v)) || 0),
    isPaid: z.boolean().optional().default(false),
});

export const createCargoBookingSchema = z.object({
    // Service type
    service: ServiceType,
    boxSubType: BoxSubType.optional().nullable(),
    cargoSize: z.string().max(20).optional().default("MEDIUM"),

    // Flags
    flags: z.object({
        fragile: z.boolean().optional().default(false),
        hazardous: z.boolean().optional().default(false),
        live: z.boolean().optional().default(false),
    }).optional(),

    // Common fields
    value: z.string().max(50).optional().nullable(),
    price: z.string().max(50).optional().nullable(),

    // Container specific
    containerNo: z.string().max(50).optional().nullable(),
    chassisNo: z.string().max(50).optional().nullable(),
    temperature: z.string().max(20).optional().nullable(),
    containerSize: z.string().max(20).optional().nullable(),
    containerType: z.string().max(30).optional().nullable(),
    contents: z.string().max(1000).optional().nullable(),

    // Pallet specific
    palletNo: z.string().max(50).optional().nullable(),
    reeferNo: z.string().max(50).optional().nullable(),
    palletHeight: z.string().max(20).optional().nullable(),
    palletType: z.string().max(30).optional().nullable(),
    decksNo: z.string().max(20).optional().nullable(),

    // Luggage specific
    material: z.string().max(50).optional().nullable(),
    color: z.string().max(30).optional().nullable(),
    luggageType: z.string().max(50).optional().nullable(),

    // Envelope specific
    envelopeType: z.string().max(20).optional().nullable(),

    // Bundle specific
    bundleMaterial: z.string().max(50).optional().nullable(),
    bundleQuantity: z.string().max(20).optional().nullable(),
    bundleLength: z.string().max(20).optional().nullable(),
    bundleSize: z.string().max(30).optional().nullable(),
    itemLocation: z.string().max(20).optional().nullable(),
    itemNumber: z.string().max(30).optional().nullable(),

    // Other specific
    itemName: z.string().max(200).optional().nullable(),

    // Dates & locations
    bookingDate: z.string().min(1, "Booking date is required"),
    fromLocation: z.string().min(1, "From location is required").max(20),
    toLocation: z.string().min(1, "To location is required").max(20),
    voyageId: z.string().max(50).optional().nullable(),
    voyageNo: z.string().max(20).optional().nullable(),

    // Contact details
    contactName: z.string().min(1, "Contact name is required").max(200).trim(),
    contactEmail: z.string().email().max(255).optional().nullable().or(z.literal("")),
    contactPhone: z.string().max(30).optional().nullable().or(z.literal("")),
    address: z.string().max(500).optional().nullable().or(z.literal("")),
    idType: z.string().max(30).optional().default("Passport"),

    // Deficiency
    damageFound: DamageType.optional().nullable(),
    damageLocation: DamageLocation.optional().nullable(),
    deficiencyComment: z.string().max(2000).optional().nullable(),

    // Additional Services
    hasTape: z.boolean().optional().default(false),
    wrapType: z.string().max(10).optional().nullable(),
    hasTags: z.boolean().optional().default(false),
    insuranceAmount: z.union([z.number(), z.string()]).optional().nullable(),
    additionalServicePrice: z.union([z.number(), z.string()]).optional().default(0),

    // Payment — ALWAYS forced to UNPAID on creation (server-side override)
    paymentStatus: PaymentStatus.optional(),
    remark: z.string().max(2000).optional().nullable(),

    // Items
    items: z.array(cargoItemSchema).min(1, "At least one item is required"),

    // Images (URLs after upload)
    containerImages: z.array(z.object({
        url: z.string().url().max(500),
        caption: z.string().max(200).optional(),
    })).optional().default([]),
    userDocuments: z.array(z.object({
        url: z.string().url().max(500),
        caption: z.string().max(200).optional(),
    })).optional().default([]),

    // Legacy
    quantity: z.union([z.number(), z.string()]).optional().nullable(),
    pallets: z.union([z.number(), z.string()]).optional().nullable(),
    type: z.string().max(20).optional(),
    size: z.string().max(20).optional().nullable(),
    height: z.string().max(20).optional().nullable(),
    boxContains: z.string().max(1000).optional().nullable(),
}).refine(
    (data) => data.fromLocation !== data.toLocation,
    { message: "From and To locations cannot be the same", path: ["toLocation"] }
);

// ============================================
// PASSENGER BOOKING
// ============================================

const luggageItemSchema = z.object({
    type: z.string().max(50),
    weight: z.union([z.number(), z.string()]).transform((v) => parseFloat(String(v)) || 0),
    quantity: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v)) || 1),
    price: z.union([z.number(), z.string()]).transform((v) => parseFloat(String(v)) || 0),
});

export const createPassengerBookingSchema = z.object({
    infantCount: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v)) || 0),
    childCount: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v)) || 0),
    adultCount: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v)) || 0),

    name: z.string().min(1, "Name is required").max(200).trim(),
    email: z.string().email().max(255).optional().or(z.literal("")),
    contact: z.string().max(30).optional().or(z.literal("")),

    bookingDate: z.string().min(1, "Booking date is required"),
    fromLocation: z.string().min(1, "Departure location is required").max(20),
    toLocation: z.string().min(1, "Destination is required").max(20),

    voyageId: z.string().max(50).optional().nullable(),
    idType: z.string().max(30).optional().default("Passport"),
    paymentStatus: PaymentStatus.optional(),
    remark: z.string().max(2000).optional().nullable(),
    totalAmount: z.union([z.number(), z.string()]).transform((v) => parseFloat(String(v)) || 0),

    luggage: z.array(luggageItemSchema).optional().default([]),
}).refine(
    (data) => data.fromLocation !== data.toLocation,
    { message: "Departure and destination cannot be the same", path: ["toLocation"] }
).refine(
    (data) => {
        const total = (typeof data.infantCount === 'number' ? data.infantCount : 0)
            + (typeof data.childCount === 'number' ? data.childCount : 0)
            + (typeof data.adultCount === 'number' ? data.adultCount : 0);
        return total > 0;
    },
    { message: "At least one passenger is required", path: ["adultCount"] }
);

// ============================================
// INVOICE
// ============================================

export const updateInvoiceSchema = z.object({
    paymentStatus: PaymentStatus.optional(),
    paymentMode: z.string().max(50).optional(),
});

// ============================================
// PRICE
// ============================================

export const createPriceSchema = z.object({
    category: z.string().min(1, "Category is required").max(30),
    size: z.string().min(1, "Size is required").max(30),
    type: z.string().max(20).optional().nullable(),
    value: z.union([z.number(), z.string()]).transform((v) => {
        const n = parseFloat(String(v));
        if (isNaN(n) || n < 0) throw new Error("Value must be a positive number");
        return n;
    }),
    fromCode: z.string().min(1, "From location code is required").max(20),
    toCode: z.string().min(1, "To location code is required").max(20),
});

// ============================================
// LOCATION
// ============================================

export const createLocationSchema = z.object({
    code: z.string().min(1, "Code is required").max(20),
    name: z.string().min(1, "Name is required").max(100),
});

export const updateLocationSchema = z.object({
    code: z.string().max(20).optional(),
    name: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
});

// ============================================
// VOYAGE
// ============================================

const voyageStopSchema = z.object({
    locationCode: z.string().max(20),
    stopOrder: z.number().optional(),
    arrivalTime: z.string().max(20).optional().nullable(),
    departureTime: z.string().max(20).optional().nullable(),
    activities: z.array(z.string().max(50)).optional().default([]),
    notes: z.string().max(500).optional().nullable(),
});

export const createVoyageSchema = z.object({
    voyageNo: z.union([z.number(), z.string()]).transform((v) => {
        const n = parseInt(String(v));
        if (isNaN(n)) throw new Error("Voyage number must be a valid integer");
        return n;
    }),
    shipName: z.string().min(1, "Ship name is required").max(50).optional(),
    vesselName: z.string().max(50).optional(),
    date: z.string().optional(),
    departureDate: z.string().optional(),
    fromLocationCode: z.string().max(20).optional(),
    fromCode: z.string().max(20).optional(),
    toLocationCode: z.string().max(20).optional(),
    toCode: z.string().max(20).optional(),
    status: z.string().max(20).optional(),
    scheduleId: z.string().max(50).optional().nullable(),
    stops: z.array(voyageStopSchema).optional(),
});

// ============================================
// EQUIPMENT
// ============================================

export const createEquipmentSchema = z.object({
    type: z.enum(["FORKLIFT", "MULE", "CHASSIS", "CONTAINER", "FLAT_RACK"]),
    name: z.string().min(1, "Name is required").max(100).trim(),
    identifier: z.string().max(100).optional().nullable(),
    locationCode: z.string().min(1, "Location is required").max(20),
    status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]).optional().default("AVAILABLE"),
});

// ============================================
// INCIDENT
// ============================================

export const createIncidentSchema = z.object({
    incidentType: z.string().min(1, "Incident type is required").max(100),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().min(1, "Description is required").max(5000),
    location: z.string().min(1, "Location is required").max(100),
    invoiceNo: z.string().max(50).optional().nullable(),
    date: z.string().optional(),
    time: z.string().max(20).optional().nullable(),
    insuranceTaken: z.boolean().optional().default(false),
    shipmentDetails: z.string().max(2000).optional().nullable(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
    images: z.array(z.string().url().max(500)).optional().default([]),
});

// ============================================
// NOTIFICATION
// ============================================

export const createNotificationSchema = z.object({
    userId: z.string().max(50).optional(),
    userIds: z.array(z.string().max(50)).optional(),
    title: z.string().min(1, "Title is required").max(200),
    message: z.string().min(1, "Message is required").max(2000),
    type: z.string().max(30).optional().default("system"),
}).refine(
    (data) => data.userId || (data.userIds && data.userIds.length > 0),
    { message: "At least one userId is required", path: ["userId"] }
);

// ============================================
// MANIFEST
// ============================================

export const createManifestItemSchema = z.object({
    voyageId: z.string().min(1, "Voyage ID is required").max(50),
    cargoBookingId: z.string().max(50).optional().nullable(),
    passengerBookingId: z.string().max(50).optional().nullable(),
    invoiceNo: z.string().max(50).optional().nullable(),
    senderName: z.string().min(1, "Sender name is required").max(200),
    receiverName: z.string().max(200).optional().nullable(),
    itemDetails: z.string().min(1, "Item details are required").max(2000),
    quantity: z.number().optional().default(1),
    amount: z.union([z.number(), z.string()]).transform((v) => parseFloat(String(v)) || 0),
    notes: z.string().max(2000).optional().nullable(),
});

// ============================================
// UPLOAD
// ============================================

export const uploadSchema = z.object({
    imageType: z.string().min(1, "Image type is required").max(30),
    bookingType: z.enum(["cargo", "passenger"]).optional(),
    bookingId: z.string().max(50).optional(),
});

// ============================================
// HELPER: Parse and return errors
// ============================================

export function parseValidation<T>(
    schema: z.ZodType<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${path}${issue.message}`;
    });
    return { success: false, errors };
}