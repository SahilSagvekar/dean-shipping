const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log("Fixing schedules...");

    // Find all schedules and publish them, and add a test event if empty
    const schedules = await prisma.schedule.findMany({
        include: { events: true }
    });

    for (const s of schedules) {
        const updateData = {
            isPublished: true,
            isLaunched: true
        };

        if (s.events.length === 0) {
            updateData.events = {
                create: [
                    {
                        location: "Nassau",
                        time: "8am - 12pm",
                        type: "Freight Drop Off",
                        notes: "Auto-generated test event",
                        sortOrder: 0
                    }
                ]
            };
        }

        await prisma.schedule.update({
            where: { id: s.id },
            data: updateData
        });
        console.log(`Published schedule ${s.id} for ${s.shipName} on ${s.date.toISOString()}`);
    }
}

fix().catch(console.error).finally(() => prisma.$disconnect());
