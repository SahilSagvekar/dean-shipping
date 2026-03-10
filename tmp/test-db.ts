import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing database connection...");
        const userCount = await prisma.user.count();
        console.log(`Connection successful. User count: ${userCount}`);

        console.log("Testing systemSetting model...");
        const settings = await (prisma as any).systemSetting.findMany();
        console.log(`SystemSetting found. Count: ${settings.length}`);
    } catch (err: any) {
        console.error("Database test failed:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
