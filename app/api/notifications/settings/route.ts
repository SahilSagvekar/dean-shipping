import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, createAuditLog, getClientIp } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const settings = await prisma.systemSetting.findMany({
        where: {
            key: {
                in: ['REMINDER_FREQUENCY', 'REMINDER_AUTOMATION_ACTIVE', 'REMINDER_LAST_RUN']
            }
        }
    });

    const formattedSettings = settings.reduce((acc: any, s) => {
        acc[s.key] = s.value;
        return acc;
    }, {});

    return NextResponse.json({ settings: formattedSettings });
}

export async function POST(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { frequency, automationActive } = body;

        const updates = [];

        if (frequency) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: 'REMINDER_FREQUENCY' },
                update: { value: frequency },
                create: { key: 'REMINDER_FREQUENCY', value: frequency, type: 'string', description: 'Reminder frequency setting' }
            }));
        }

        if (automationActive !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: 'REMINDER_AUTOMATION_ACTIVE' },
                update: { value: String(automationActive) },
                create: { key: 'REMINDER_AUTOMATION_ACTIVE', value: String(automationActive), type: 'boolean', description: 'Enable/Disable automated reminders' }
            }));
        }

        await Promise.all(updates);

        await createAuditLog({
            userId: result.user.id,
            action: "UPDATE_REMINDER_SETTINGS",
            entity: "system_setting",
            entityId: "notification_automation",
            metadata: { frequency, automationActive },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ message: "Settings updated successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
    }
}
