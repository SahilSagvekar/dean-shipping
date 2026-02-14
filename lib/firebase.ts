import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2OnI7IiGc2cgMQnKySCS6q9fhlbRWfT8",
  authDomain: "login-with-firebase-ff94b.firebaseapp.com",
  projectId: "login-with-firebase-ff94b",
  storageBucket: "login-with-firebase-ff94b.firebasestorage.app",
  messagingSenderId: "558166981009",
  appId: "1:558166981009:web:e42b656b147400599b0230"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);