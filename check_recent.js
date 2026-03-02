const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const schedules = await prisma.schedule.findMany({
        include: { events: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    console.log("Recent schedules in DB:");
    schedules.forEach(s => {
        console.log(`- ID: ${s.id}, Ship: ${s.shipName}, Date: ${s.date.toISOString()}, Published: ${s.isPublished}, Events: ${s.events.length}`);
    });
}

check().catch(console.error).finally(() => prisma.$disconnect());
