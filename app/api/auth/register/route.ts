// ============================================
// POST /api/auth/register
// ============================================
// Register a new user after Firebase phone verification
// Client flow: Firebase phone OTP → get idToken → call this endpoint

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, createAuditLog, getClientIp } from "@/lib/auth";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firebaseIdToken, firstName, lastName, email, countryCode, mobileNumber } = body;

        // Validate required fields
        if (!firebaseIdToken || !firstName || !lastName || !email || !mobileNumber) {
            return NextResponse.json(
                { error: "Missing required fields: firebaseIdToken, firstName, lastName, email, mobileNumber" },
                { status: 400 }
            );
        }

        // Verify the Firebase ID token
        // (bypass-mock-token- is accepted when NEXT_PUBLIC_BYPASS_OTP=true)
        const decodedToken = await verifyFirebaseToken(firebaseIdToken);
        const isBypass = process.env.NEXT_PUBLIC_BYPASS_OTP === "true" && firebaseIdToken.startsWith("bypass-mock-token-");
        const firebaseUid = decodedToken.uid;

        // Check phone number matches Firebase — skip during bypass (phone_number is null)
        const firebasePhone = decodedToken.phone_number;
        const fullMobile = `${countryCode || "+1"}${mobileNumber}`;
        if (!isBypass && firebasePhone && firebasePhone !== fullMobile) {
            return NextResponse.json(
                { error: "Phone number mismatch with Firebase verification" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { mobileNumber },
                    { firebaseUid },
                ],
            },
        });

        if (existingUser) {
            const conflict =
                existingUser.email === email ? "Email" :
                    existingUser.mobileNumber === mobileNumber ? "Mobile number" :
                        "Account";
            return NextResponse.json(
                { error: `${conflict} already registered` },
                { status: 409 }
            );
        }

        // Create the user
        const user = await prisma.user.create({
            data: {
                firebaseUid,
                firstName,
                lastName,
                email,
                countryCode: countryCode || "+1",
                mobileNumber,
                role: "USER",
            },
        });

        // Generate JWT
        const token = generateToken({
            userId: user.id,
            role: user.role,
            email: user.email,
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: "REGISTER",
            entity: "user",
            entityId: user.id,
            ipAddress: getClientIp(request),
        });

        return NextResponse.json(
            {
                message: "Account created successfully",
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: error.message || "Registration failed" },
            { status: 500 }
        );
    }
}
