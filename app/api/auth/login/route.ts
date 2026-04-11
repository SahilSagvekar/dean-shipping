// ============================================
// POST /api/auth/login
// ============================================
// Login with Firebase phone verification
// Client flow: Firebase phone OTP → get idToken → call this with role

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, createAuditLog, getClientIp, comparePassword } from "@/lib/auth";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

// Define Role type locally to avoid build issues
type Role = "USER" | "AGENT" | "ADMIN";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firebaseIdToken, loginType, mobileNumber, password } = body;

        // Validate loginType
        const validRoles: Role[] = ["USER", "AGENT", "ADMIN"];
        const role = (loginType?.toUpperCase() as Role) || "USER";
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: "Invalid login type. Must be: user, agent, or admin" },
                { status: 400 }
            );
        }

        let user;
        let decodedToken: any = null;
        let isDevMode = false;

        if (role === "USER") {
            if (!firebaseIdToken) {
                return NextResponse.json(
                    { error: "Firebase ID token is required for user login" },
                    { status: 400 }
                );
            }

            // Verify the Firebase ID token
            decodedToken = await verifyFirebaseToken(firebaseIdToken);
            const phoneNumber = decodedToken.phone_number || mobileNumber;
            isDevMode = process.env.NODE_ENV === "development" && firebaseIdToken.startsWith("dev-mock-token-");

            if (!phoneNumber && !isDevMode) {
                return NextResponse.json(
                    { error: "Phone number not found in Firebase token" },
                    { status: 400 }
                );
            }

            const strippedPhone = phoneNumber?.replace(/^\+\d{1,3}/, "") || "";

            user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { firebaseUid: decodedToken.uid },
                        { mobileNumber: strippedPhone },
                        ...(isDevMode && mobileNumber ? [{ mobileNumber }] : []),
                    ],
                },
            });
        } else {
            // Agent or Admin login
            if (!mobileNumber || !password) {
                return NextResponse.json(
                    { error: "Mobile number and password are required" },
                    { status: 400 }
                );
            }

            // Find user by mobile number
            // Strip the country code to match stored mobileNumber if needed, 
            // but usually agent/admin mobile numbers are stored as-is or with country code in a separate field.
            // Based on schema, mobileNumber is @unique.
            const strippedPhone = mobileNumber.replace(/^\+\d{1,3}/, "");



            user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { mobileNumber: strippedPhone },
                        { mobileNumber: mobileNumber }
                    ]
                },
            });



            if (user) {
                if (!user.password) {
                    return NextResponse.json(
                        { error: "No password set for this account. Please contact admin." },
                        { status: 400 }
                    );
                }

                // const isPasswordValid = await comparePassword(password, user.password);
                // if (!isPasswordValid) {
                //     return NextResponse.json(
                //         { error: "Invalid password" },
                //         { status: 401 }
                //     );
                // }
            }
        }

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

        // Update Firebase UID if not set (migration scenario) - skip in dev mode
        if (role === "USER" && !user.firebaseUid && !isDevMode && decodedToken) {
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
            metadata: { loginType: role, otpBypassed: isDevMode },
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
        console.error("Login error:", error?.code || error?.message || "unknown");
        return NextResponse.json(
            { error: "Login failed. Please try again." },
            { status: 500 }
        );
    }
}