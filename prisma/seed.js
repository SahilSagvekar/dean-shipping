// ============================================
// PRISMA SEED FILE
// ============================================
// Run with: npx prisma db seed

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // ============================================
    // LOCATIONS
    // ============================================
    console.log("Creating locations...");
    const locations = await Promise.all([
        prisma.location.upsert({
            where: { code: "NAS" },
            update: {},
            create: { code: "NAS", name: "Nassau" },
        }),
        prisma.location.upsert({
            where: { code: "GTC" },
            update: {},
            create: { code: "GTC", name: "Green Turtle Cay" },
        }),
        prisma.location.upsert({
            where: { code: "MHA" },
            update: {},
            create: { code: "MHA", name: "Marsh Harbour" },
        }),
        prisma.location.upsert({
            where: { code: "GGC_BB" },
            update: {},
            create: { code: "GGC_BB", name: "GGC / Bakers Bay" },
        }),
        prisma.location.upsert({
            where: { code: "MOW_HPT" },
            update: {},
            create: { code: "MOW_HPT", name: "MOW / Hope Town" },
        }),
        prisma.location.upsert({
            where: { code: "NA" },
            update: {},
            create: { code: "NA", name: "North Abaco" },
        }),
    ]);
    console.log(`✅ Created ${locations.length} locations`);

    // ============================================
    // PRICES
    // ============================================
    console.log("Creating prices...");
    const nassau = locations.find((l) => l.code === "NAS");
    const gtc = locations.find((l) => l.code === "GTC");
    const mha = locations.find((l) => l.code === "MHA");

    const priceData = [
        // DRY BOX prices - NAS to GTC
        { category: "DRY_BOX", size: "Small", value: 50, fromId: nassau.id, toId: gtc.id },
        { category: "DRY_BOX", size: "Medium", value: 75, fromId: nassau.id, toId: gtc.id },
        { category: "DRY_BOX", size: "Large", value: 100, fromId: nassau.id, toId: gtc.id },
        
        // FROZEN BOX prices - NAS to GTC
        { category: "FROZEN_BOX", size: "Small", value: 65, fromId: nassau.id, toId: gtc.id },
        { category: "FROZEN_BOX", size: "Medium", value: 90, fromId: nassau.id, toId: gtc.id },
        { category: "FROZEN_BOX", size: "Large", value: 120, fromId: nassau.id, toId: gtc.id },

        // COOLER BOX prices - NAS to GTC
        { category: "COOLER_BOX", size: "Small", value: 60, fromId: nassau.id, toId: gtc.id },
        { category: "COOLER_BOX", size: "Medium", value: 85, fromId: nassau.id, toId: gtc.id },
        { category: "COOLER_BOX", size: "Large", value: 110, fromId: nassau.id, toId: gtc.id },

        // CONTAINER prices - NAS to GTC
        { category: "CONTAINER", size: "20 ft", type: "DRY", value: 1000, fromId: nassau.id, toId: gtc.id },
        { category: "CONTAINER", size: "40 ft", type: "DRY", value: 1800, fromId: nassau.id, toId: gtc.id },
        { category: "CONTAINER", size: "20 ft", type: "FROZEN", value: 1400, fromId: nassau.id, toId: gtc.id },
        { category: "CONTAINER", size: "40 ft", type: "FROZEN", value: 2400, fromId: nassau.id, toId: gtc.id },

        // ENVELOPE prices
        { category: "ENVELOPE", size: "Standard", value: 15, fromId: nassau.id, toId: gtc.id },
        { category: "ENVELOPE", size: "Large", value: 25, fromId: nassau.id, toId: gtc.id },

        // LUGGAGE prices
        { category: "LUGGAGE", size: "Small", value: 30, fromId: nassau.id, toId: gtc.id },
        { category: "LUGGAGE", size: "Medium", value: 50, fromId: nassau.id, toId: gtc.id },
        { category: "LUGGAGE", size: "Large", value: 75, fromId: nassau.id, toId: gtc.id },

        // PALLET prices
        { category: "PALLET", size: "4 ft", value: 200, fromId: nassau.id, toId: gtc.id },
        { category: "PALLET", size: "6 ft", value: 300, fromId: nassau.id, toId: gtc.id },

        // VEHICLE prices
        { category: "VEHICLE", size: "Motorcycle", value: 150, fromId: nassau.id, toId: gtc.id },
        { category: "VEHICLE", size: "Small Car", value: 400, fromId: nassau.id, toId: gtc.id },
        { category: "VEHICLE", size: "SUV/Truck", value: 600, fromId: nassau.id, toId: gtc.id },

        // PASSENGER prices
        { category: "PASSENGER", size: "Infant", value: 0, fromId: nassau.id, toId: gtc.id },
        { category: "PASSENGER", size: "Child", value: 75, fromId: nassau.id, toId: gtc.id },
        { category: "PASSENGER", size: "Adult", value: 150, fromId: nassau.id, toId: gtc.id },

        // NAS to MHA prices (sample)
        { category: "DRY_BOX", size: "Small", value: 55, fromId: nassau.id, toId: mha.id },
        { category: "DRY_BOX", size: "Medium", value: 80, fromId: nassau.id, toId: mha.id },
        { category: "DRY_BOX", size: "Large", value: 110, fromId: nassau.id, toId: mha.id },
        { category: "PASSENGER", size: "Adult", value: 175, fromId: nassau.id, toId: mha.id },
    ];

    for (const price of priceData) {
        await prisma.price.upsert({
            where: {
                category_size_type_fromId_toId: {
                    category: price.category,
                    size: price.size,
                    type: price.type || null,
                    fromId: price.fromId,
                    toId: price.toId,
                },
            },
            update: { value: price.value },
            create: price,
        });
    }
    console.log(`✅ Created ${priceData.length} prices`);

    // ============================================
    // ADMIN USER
    // ============================================
    console.log("Creating admin user...");
    const admin = await prisma.user.upsert({
        where: { email: "admin@deanshipping.com" },
        update: {},
        create: {
            firstName: "Cicily",
            lastName: "Dean",
            email: "admin@deanshipping.com",
            countryCode: "+1",
            mobileNumber: "2421234567",
            role: "ADMIN",
        },
    });
    console.log(`✅ Created admin: ${admin.email}`);

    // ============================================
    // SAMPLE AGENT
    // ============================================
    console.log("Creating sample agent...");
    const agent = await prisma.user.upsert({
        where: { email: "agent@deanshipping.com" },
        update: {},
        create: {
            firstName: "Smith",
            lastName: "Frank",
            email: "agent@deanshipping.com",
            countryCode: "+1",
            mobileNumber: "2429876543",
            role: "AGENT",
            agentCode: "AGT001",
            agentLocation: "NAS",
        },
    });
    console.log(`✅ Created agent: ${agent.email}`);

    // ============================================
    // EQUIPMENT
    // ============================================
    console.log("Creating equipment...");
    const equipmentData = [
        { type: "FORKLIFT", name: "FORKLIFT #01", identifier: "FL001", locationId: nassau.id },
        { type: "FORKLIFT", name: "FORKLIFT #02", identifier: "FL002", locationId: nassau.id },
        { type: "FORKLIFT", name: "FORKLIFT #03", identifier: "FL003", locationId: mha.id },
        { type: "MULE_TRACTOR", name: "MULE/TRACTOR #01", identifier: "MT001", locationId: nassau.id },
        { type: "MULE_TRACTOR", name: "MULE/TRACTOR #02", identifier: "MT002", locationId: gtc.id },
        { type: "CHASSIS", name: "CHASSIS #01", identifier: "CH001", locationId: nassau.id },
        { type: "CHASSIS", name: "CHASSIS #02", identifier: "CH002", locationId: nassau.id },
        { type: "CHASSIS", name: "CHASSIS #03", identifier: "CH003", locationId: mha.id },
        { type: "CHASSIS", name: "CHASSIS #04", identifier: "CH004", locationId: gtc.id },
        { type: "CONTAINER_EQ", name: "CONTAINER #24563", identifier: "CN24563", locationId: nassau.id },
        { type: "CONTAINER_EQ", name: "CONTAINER #20003", identifier: "CN20003", locationId: nassau.id },
        { type: "FLAT_RACK", name: "FLAT RACK #10923", identifier: "FR10923", locationId: nassau.id },
        { type: "FLAT_RACK", name: "FLAT RACK #20003", identifier: "FR20003", locationId: nassau.id },
    ];

    for (const eq of equipmentData) {
        await prisma.equipment.upsert({
            where: { id: eq.identifier },
            update: {},
            create: eq,
        });
    }
    console.log(`✅ Created ${equipmentData.length} equipment items`);

    // ============================================
    // SYSTEM SETTINGS
    // ============================================
    console.log("Creating system settings...");
    const settings = [
        { key: "vat_percent", value: "12", type: "number", description: "VAT percentage" },
        { key: "default_currency", value: "USD", type: "string", description: "Default currency" },
        { key: "reminder_frequency", value: "EVERY_2_DAYS", type: "string", description: "Default payment reminder frequency" },
        { key: "max_booking_advance_days", value: "30", type: "number", description: "Max days in advance for booking" },
        { key: "company_name", value: "Dean's Shipping Ltd.", type: "string", description: "Company name" },
        { key: "company_email", value: "info@deanshipping.com", type: "string", description: "Company email" },
        { key: "company_phone", value: "+1 242 123 4567", type: "string", description: "Company phone" },
    ];

    for (const setting of settings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log(`✅ Created ${settings.length} system settings`);

    console.log("\n🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
