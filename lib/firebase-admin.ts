import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// export async function verifyFirebaseToken(idToken: string) {
//   return admin.auth().verifyIdToken(idToken);
// }

export async function verifyFirebaseToken(token: string) {
  // DEV BYPASS - remove in production
  if (process.env.NODE_ENV === "development" && token.startsWith("dev-mock-token-")) {
    return {
      uid: "dev-uid-" + token.split("-").pop(),
      phone_number: null,
    };
  }

  return await  admin.auth().verifyIdToken(token);
}