// ============================================
// FIREBASE ADMIN SDK
// ============================================
// Used for: Phone OTP verification
// Firebase Auth handles phone number verification on the client,
// then we verify the Firebase ID token on the server.

import * as admin from "firebase-admin";

// Prevent re-initialization in development (hot reload)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // The private key comes with escaped newlines from env
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export const firebaseAuth = admin.auth();

/**
 * Verify a Firebase ID token (from client-side phone auth)
 * @param idToken - The Firebase ID token from the client
 * @returns The decoded token with user info
 */
export async function verifyFirebaseToken(idToken: string) {
    try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error("Invalid or expired Firebase token");
    }
}

/**
 * Get phone number from Firebase UID
 */
export async function getPhoneFromFirebaseUid(
    uid: string
): Promise<string | undefined> {
    try {
        const userRecord = await firebaseAuth.getUser(uid);
        return userRecord.phoneNumber ?? undefined;
    } catch {
        return undefined;
    }
}
