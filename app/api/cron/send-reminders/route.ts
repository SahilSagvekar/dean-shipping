// ============================================
// GET /api/cron/send-reminders
// ============================================
// Vercel Cron job that runs daily at 11 AM EST (16:00 UTC).
// Checks if it's time to send reminders based on frequency (3/7/10 days).
// If due, sends payment reminder emails to all users with unpaid invoices.
//
// Vercel Cron: Configure in vercel.json with schedule "0 16 * * *" (11 AM EST = 16:00 UTC)

import { NextRequest, NextResponse } from "next/server";
import { processAutomatedReminders } from "@/lib/automation";

// Verify the request is from Vercel Cron
function verifyCronRequest(request: NextRequest): boolean {
    if (process.env.NODE_ENV === "development") return true;
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        console.warn("CRON_SECRET not set — cron job disabled in production");
        return false;
    }
    return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
    // if (!verifyCronRequest(request)) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    return NextResponse.json({
        message: "Cron job is temporarily disabled",
    });

    /*
    try {
        console.log(`[Cron] Running send-reminders at ${new Date().toISOString()}`);
        const result = await processAutomatedReminders();
        console.log(`[Cron] Reminder result:`, result);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Cron] Error in send-reminders:", error);
        return NextResponse.json(
            { error: error.message || "Cron job failed" },
            { status: 500 }
        );
    }
    */
}