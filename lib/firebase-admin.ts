// ============================================
// FIREBASE ADMIN SDK
// ============================================
// Server-side Firebase authentication

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
        );
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

const app = getFirebaseAdmin();
export const adminAuth = getAuth(app);

export interface DecodedFirebaseToken {
    uid: string;
    phone_number: string | null;
}

/**
 * Verify a Firebase ID token
 * Includes dev bypass for testing without Firebase billing
 */
export async function verifyFirebaseToken(token: string): Promise<DecodedFirebaseToken> {
    // ── TEMPORARY BYPASS ──────────────────────────────────────────────────────
    // Active when NEXT_PUBLIC_BYPASS_OTP=true (works in both dev & production).
    // Remove this block — or unset the env var — before going live.
    if (process.env.NEXT_PUBLIC_BYPASS_OTP === "true" && token.startsWith("bypass-mock-token-")) {
        console.warn("[OTP BYPASS] Skipping Firebase token verification.");
        return {
            uid: "bypass-uid-" + token.split("-").pop(),
            phone_number: null, // mobileNumber from request body is used instead
        };
    }
    // ──────────────────────────────────────────────────────────────────────────

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            phone_number: decodedToken.phone_number || null,
        };
    } catch (error: any) {
        console.error("Firebase token verification error:", error);
        throw new Error("Invalid Firebase token");
    }
}

/**
 * Get a user by phone number from Firebase
 */
export async function getFirebaseUserByPhone(phoneNumber: string) {
    try {
        return await adminAuth.getUserByPhoneNumber(phoneNumber);
    } catch {
        return null;
    }
}

/**
 * Delete a Firebase user
 */
export async function deleteFirebaseUser(uid: string) {
    try {
        await adminAuth.deleteUser(uid);
    } catch (error) {
        console.error("Failed to delete Firebase user:", error);
    }
}
