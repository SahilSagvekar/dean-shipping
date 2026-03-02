const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const schedules = await prisma.schedule.findMany({
        include: { events: true },
        orderBy: { date: 'asc' }
    });

    console.log(`Total schedules: ${schedules.length}`);
    schedules.forEach(s => {
        console.log(`Ship: ${s.shipName}, Date: ${s.date.toISOString()}, Published: ${s.isPublished}, LaunchAt: ${s.launchAt}, Events: ${s.events.length}`);
    });
}

check().catch(console.error).finally(() => prisma.$disconnect());
