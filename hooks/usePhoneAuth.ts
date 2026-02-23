// ============================================
// PHONE AUTHENTICATION HOOK
// ============================================
// Custom hook for Firebase phone OTP authentication

"use client";

import { useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

interface UsePhoneAuthReturn {
  sendOtp: (phoneNumber: string, buttonId: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<string | null>;
  resendOtp: (phoneNumber: string, buttonId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function usePhoneAuth(): UsePhoneAuthReturn {
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = useCallback(() => setError(null), []);

  /**
   * Setup invisible reCAPTCHA verifier
   */
  const setupRecaptcha = useCallback((buttonId: string) => {
    // Clear existing verifier if any
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // Ignore clear errors
      }
    }

    // Create new verifier
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA verified");
      },
      "expired-callback": () => {
        setError("reCAPTCHA expired. Please try again.");
        (window as any).recaptchaVerifier = null;
      },
    });
  }, []);

  /**
   * Send OTP to phone number
   */
  const sendOtp = useCallback(async (phoneNumber: string, buttonId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!phoneNumber.startsWith("+")) {
        throw new Error("Phone number must include country code (e.g., +1)");
      }

      // ── TEMPORARY BYPASS ─────────────────────────────────────────────────
      // Set NEXT_PUBLIC_BYPASS_OTP=true in .env (local) or Vercel env vars
      // (production) to skip real Firebase SMS while still developing.
      // Remove or set to false before going live with real users.
      // Accepts any 6-digit code while bypassed.
      if (process.env.NEXT_PUBLIC_BYPASS_OTP === "true") {
        console.warn("[OTP BYPASS ACTIVE] Any 6-digit code will be accepted.");
        setConfirmationResult({
          confirm: async (code: string) => {
            if (!/^\d{6}$/.test(code)) {
              throw new Error("Invalid OTP — must be exactly 6 digits.");
            }
            return {
              user: {
                uid: "bypass-uid-" + Date.now(),
                phoneNumber,
                getIdToken: async () => "bypass-mock-token-" + Date.now(),
              },
            };
          },
        } as any);
        return true;
      }
      // ─────────────────────────────────────────────────────────────────────

      // Real Firebase flow
      setupRecaptcha(buttonId);
      const appVerifier = (window as any).recaptchaVerifier;

      if (!appVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);

      console.log("OTP sent successfully to:", phoneNumber);
      return true;
    } catch (err: any) {
      console.error("Send OTP error:", err);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (err.code === "auth/quota-exceeded") {
        errorMessage = "SMS quota exceeded. Please try again later.";
      } else if (err.code === "auth/billing-not-enabled") {
        errorMessage = "Phone authentication requires Firebase Blaze plan. Please upgrade your Firebase project at console.firebase.google.com";
      } else if (err.code === "auth/configuration-not-found") {
        errorMessage = "Firebase configuration error. Please check your setup.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          // Ignore
        }
        (window as any).recaptchaVerifier = null;
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [setupRecaptcha]);



  /**
   * Verify OTP and get Firebase ID token
   */
  const verifyOtp = useCallback(async (otp: string): Promise<string | null> => {
    if (!confirmationResult) {
      setError("Please request OTP first");
      return null;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      console.log("OTP verified successfully");
      return idToken;
    } catch (err: any) {
      console.error("Verify OTP error:", err);

      let errorMessage = "Invalid OTP. Please try again.";

      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid OTP code.";
      } else if (err.code === "auth/code-expired") {
        errorMessage = "OTP expired. Please request a new one.";
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [confirmationResult]);

  /**
   * Resend OTP to phone number
   */
  const resendOtp = useCallback(async (phoneNumber: string, buttonId: string): Promise<boolean> => {
    setConfirmationResult(null);

    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // Ignore
      }
      (window as any).recaptchaVerifier = null;
    }

    return sendOtp(phoneNumber, buttonId);
  }, [sendOtp]);

  return {
    sendOtp,
    verifyOtp,
    resendOtp,
    loading,
    error,
    clearError,
  };
}