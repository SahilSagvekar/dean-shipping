// ============================================
// DATABASE SEED SCRIPT
// ============================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting database seed...');

    // 1. Create Default Locations
    const locations = [
        { code: 'NAS', name: 'Nassau' },
        { code: 'GTC', name: 'Green Turtle Cay' },
        { code: 'MAH', name: 'Marsh Harbour' },
    ];

    console.log('📍 Seeding locations...');
    const locationMaps = {};
    for (const loc of locations) {
        const upserted = await prisma.location.upsert({
            where: { code: loc.code },
            update: {},
            create: loc,
        });
        locationMaps[loc.code] = upserted.id;
    }

    // 2. Create Default Price Categories for NAS -> GTC
    console.log('💰 Seeding default prices (NAS -> GTC)...');
    const categories = [
        { category: 'DRY_BOX', size: 'Small', value: 25.0 },
        { category: 'FROZEN_BOX', size: 'Medium', value: 45.0 },
        { category: 'COOLER_BOX', size: 'Large', value: 35.0 },
        { category: 'ENVELOPE', size: 'Standard', value: 10.0 },
        { category: 'CONTAINER', size: '20 ft', value: 1200.0, type: 'DRY' },
        { category: 'LUGGAGE', size: 'Overweight', value: 15.0 },
        { category: 'PALLET', size: 'Standard', value: 85.0 },
        { category: 'PASSENGER', size: 'Adult', value: 65.0 },
    ];

    for (const item of categories) {
        await prisma.price.create({
            data: {
                ...item,
                fromId: locationMaps['NAS'],
                toId: locationMaps['GTC'],
            },
        });
    }

    // 3. Create a Demo Admin (Optional - remove for production)
    // We don't seed passwords as we use Firebase Phone Auth, 
    // but we can create a placeholder admin record.
    console.log('👤 Seeding placeholder admin...');
    await prisma.user.upsert({
        where: { email: 'admin@deanshipping.com' },
        update: {},
        create: {
            firstName: 'Dean',
            lastName: 'Admin',
            email: 'admin@deanshipping.com',
            mobileNumber: '2425550100', // Demo Bahamas number
            role: 'ADMIN',
        },
    });

    console.log('✅ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
