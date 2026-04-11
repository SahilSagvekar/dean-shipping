// ============================================
// GET /api/users - List all users
// POST /api/users - Create a user (admin only)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, requireStaff, createAuditLog, getClientIp, hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const result = await requireStaff(request);
    if (result instanceof NextResponse) return result;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { mobileNumber: { contains: search } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                countryCode: true,
                mobileNumber: true,
                role: true,
                designation: true,
                agentCode: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return NextResponse.json({
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export async function POST(request: NextRequest) {
    const result = await requireAdmin(request);
    if (result instanceof NextResponse) return result;

    try {
        const body = await request.json();
        const { name, firstName, lastName, email, countryCode, mobileNumber, role, agentCode, password, designation } = body;



        // Support both single "name" field or split "firstName/lastName"
        let fName = firstName;
        let lName = lastName;
        if (name && !fName && !lName) {
            const parts = name.trim().split(/\s+/);
            fName = parts[0];
            lName = parts.slice(1).join(" ") || " ";
        }



        if (!fName
            // || !lName 
            || !email || !mobileNumber) {
            return NextResponse.json(
                { error: "Missing required fields: firstName/lastName (or name), email, mobileNumber" },
                { status: 400 }
            );
        }

        const hashedPassword = password ? await hashPassword(password) : undefined;

        const user = await prisma.user.create({
            data: {
                firstName: fName,
                lastName: lName,
                email,
                countryCode: countryCode || "+1",
                mobileNumber,
                role: role || "USER",
                password: hashedPassword,
                designation,
                agentCode: role === "AGENT" ? agentCode : undefined,
            },
        });

        await createAuditLog({
            userId: result.user.id,
            action: "CREATE_USER",
            entity: "user",
            entityId: user.id,
            metadata: { role: user.role },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error: any) {
        console.error("User creation error:", error?.code || error?.message);
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Email or mobile number already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
