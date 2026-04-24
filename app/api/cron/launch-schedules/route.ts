// ============================================
// GET /api/cron/launch-schedules
// ============================================
// Vercel Cron job that runs every 15 minutes to:
// 1. Find schedules with launchAt <= now that aren't published yet
// 2. Publish them (set isPublished = true, isLaunched = true)
// 3. Auto-create voyages from those schedules
//
// Vercel Cron: Configure in vercel.json with schedule "*/15 * * * *"

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Verify the request is from Vercel Cron (in production)
function verifyCronRequest(request: NextRequest): boolean {
    // In development, allow all requests
    if (process.env.NODE_ENV === "development") {
        return true;
    }

    // In production, verify the Authorization header matches CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.warn("CRON_SECRET not set - cron job disabled in production");
        return false;
    }

    return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
    // // Verify this is a legitimate cron request
    // if (!verifyCronRequest(request)) {
    //     return NextResponse.json(
    //         { error: "Unauthorized" },
    //         { status: 401 }
    //     );
    // }

    return NextResponse.json({
        message: "Cron job is temporarily disabled",
    });

    /*
    try {
        const now = new Date();
        console.log(`[Cron] Running launch-schedules at ${now.toISOString()}`);
        ... (rest of the logic commented out)
    */
}

