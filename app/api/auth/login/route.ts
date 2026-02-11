// ============================================
// POST /api/auth/login
// ============================================
// Login with Firebase phone verification
// Client flow: Firebase phone OTP → get idToken → call this with role

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, createAuditLog, getClientIp } from "@/lib/auth";
import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firebaseIdToken, loginType } = body;

        if (!firebaseIdToken) {
            return NextResponse.json(
                { error: "Firebase ID token is required" },
                { status: 400 }
            );
        }

        // Validate loginType
        const validRoles: Role[] = ["USER", "AGENT", "ADMIN"];
        const role = (loginType?.toUpperCase() as Role) || "USER";
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: "Invalid login type. Must be: user, agent, or admin" },
                { status: 400 }
            );
        }

        // Verify the Firebase ID token
        const decodedToken = await verifyFirebaseToken(firebaseIdToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return NextResponse.json(
                { error: "Phone number not found in Firebase token" },
                { status: 400 }
            );
        }

        // Find the user by Firebase UID or phone number
        // Strip the country code to match stored mobileNumber
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebaseUid: decodedToken.uid },
                    { mobileNumber: phoneNumber.replace(/^\+\d{1,3}/, "") },
                ],
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Account not found. Please register first." },
                { status: 404 }
            );
        }

        // Check if user has the requested role
        if (user.role !== role) {
            return NextResponse.json(
                { error: `No ${role.toLowerCase()} account found for this number` },
                { status: 403 }
            );
        }

        // Check if account is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: "Your account has been deactivated. Contact admin." },
                { status: 403 }
            );
        }

        // Update Firebase UID if not set (migration scenario)
        if (!user.firebaseUid) {
            await prisma.user.update({
                where: { id: user.id },
                data: { firebaseUid: decodedToken.uid },
            });
        }

        // Generate JWT
        const token = generateToken({
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: "LOGIN",
            entity: "user",
            entityId: user.id,
            metadata: { loginType: role },
            ipAddress: getClientIp(request),
        });

        return NextResponse.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobileNumber: user.mobileNumber,
                countryCode: user.countryCode,
                role: user.role,
                agentCode: user.agentCode,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: error.message || "Login failed" },
            { status: 500 }
        );
    }
}
