// ============================================
// GET /api/health - Health Check Endpoint
// ============================================
// Returns application and database health status.
// Use with monitoring tools like UptimeRobot, Vercel Cron, etc.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    const start = Date.now();

    try {
        // Test database connectivity
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = Date.now() - start;

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                status: "connected",
                latencyMs: dbLatency,
            },
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || "unknown",
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                database: {
                    status: "disconnected",
                    error: "Database connection failed",
                },
                environment: process.env.NODE_ENV,
            },
            { status: 503 }
        );
    }
}
