// ============================================
// POST /api/auth/login
// ============================================
// Login with Firebase phone verification
// Client flow: Firebase phone OTP → get idToken → call this with role

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, createAuditLog, getClientIp } from "@/lib/auth";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

// Define Role type locally to avoid build issues
type Role = "USER" | "AGENT" | "ADMIN";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firebaseIdToken, loginType, mobileNumber } = body;

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
        // (bypass-mock-token- is accepted when NEXT_PUBLIC_BYPASS_OTP=true)
        const decodedToken = await verifyFirebaseToken(firebaseIdToken);

        // When bypassed, phone_number is null — fall back to mobileNumber from body
        const isBypass = process.env.NEXT_PUBLIC_BYPASS_OTP === "true" && firebaseIdToken.startsWith("bypass-mock-token-");
        const phoneNumber = decodedToken.phone_number || mobileNumber;

        if (!phoneNumber && !isBypass) {
            return NextResponse.json(
                { error: "Phone number not found in Firebase token" },
                { status: 400 }
            );
        }

        // Find the user by phone number
        // Strip country code to match stored mobileNumber (e.g. "+14161234567" → "4161234567")
        const strippedPhone = phoneNumber?.replace(/^\+\d{1,3}/, "") || "";

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebaseUid: decodedToken.uid },
                    { mobileNumber: strippedPhone },
                    // Bypass: also try exact match with the raw mobileNumber from body
                    ...(isBypass && mobileNumber ? [{ mobileNumber }] : []),
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

        // Update Firebase UID if not set (migration scenario) — skip during bypass
        if (!user.firebaseUid && !isBypass) {
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
            metadata: { loginType: role, otpBypassed: isBypass },
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