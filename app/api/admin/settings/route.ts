// ============================================
// GET /api/admin/settings - Get system settings
// PATCH /api/admin/settings - Update settings
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireAdmin(request);
    if (result instanceof NextResponse) return result;

    const settings = await prisma.systemSetting.findMany({
        orderBy: { key: "asc" },
    });

    // Convert to key-value object
    const settingsObject = settings.reduce((acc: any, setting) => {
        let value: any = setting.value;
        if (setting.type === "number") value = parseFloat(setting.value);
        if (setting.type === "boolean") value = setting.value === "true";
        if (setting.type === "json") {
            try {
                value = JSON.parse(setting.value);
            } catch {
                value = setting.value;
            }
        }
        acc[setting.key] = value;
        return acc;
    }, {});

    return NextResponse.json({ settings: settingsObject, raw: settings });
}

export async function PATCH(request: NextRequest) {
    const result = await requireAdmin(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { settings } = body;

        if (!settings || typeof settings !== "object") {
            return NextResponse.json(
                { error: "Invalid settings object" },
                { status: 400 }
            );
        }

        const updates = await Promise.all(
            Object.entries(settings).map(async ([key, value]) => {
                const stringValue = typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value);

                const type = typeof value === "number"
                    ? "number"
                    : typeof value === "boolean"
                    ? "boolean"
                    : typeof value === "object"
                    ? "json"
                    : "string";

                return prisma.systemSetting.upsert({
                    where: { key },
                    create: { key, value: stringValue, type },
                    update: { value: stringValue, type },
                });
            })
        );

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_SETTINGS",
            entity: "system_setting",
            metadata: { keys: Object.keys(settings) },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            message: "Settings updated",
            updated: updates.length,
        });
    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
