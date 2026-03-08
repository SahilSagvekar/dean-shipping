import prisma from "./lib/prisma.js";

async function check() {
    try {
        const user = await prisma.user.findFirst({
            select: { designation: true }
        });
        console.log("Success: Designation column exists.");
        console.log("User designation:", user?.designation || "None");
    } catch (err) {
        console.error("Error checking designation:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
