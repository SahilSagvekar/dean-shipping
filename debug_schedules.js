const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.schedule.count();
    const publishedCount = await prisma.schedule.count({ where: { isPublished: true } });
    const schedules = await prisma.schedule.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        select: {
            id: true,
            shipName: true,
            date: true,
            isPublished: true
        }
    });
    console.log({ total: count, published: publishedCount, samples: schedules });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
