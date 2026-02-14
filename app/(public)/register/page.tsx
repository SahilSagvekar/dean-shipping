// ============================================
// SIGNUP PAGE WITH FIREBASE PHONE OTP
// ============================================

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import svgPaths from "@/app/imports/svg-vsq6m84fvq";

export default function Signup() {
  const router = useRouter();
  const { sendOtp, verifyOtp, resendOtp, clearError,
    loading, error } = usePhoneAuth();

  // Form state 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);

  // API state
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP input refs for focus management
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Clear errors when user types
  useEffect(() => {
    if (apiError) setApiError(null);
    if (error) clearError();
  }, [firstName, lastName, email, mobileNumber, otp]);

  /**
   * Validate form before sending OTP
   */
  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setApiError("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      setApiError("Last name is required");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setApiError("Valid email is required");
      return false;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setApiError("Valid mobile number is required");
      return false;
    }
    if (!agreedToTerms) {
      setApiError("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  /**
   * Handle Generate OTP button click
   */
  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    console.log("Sending OTP to:", fullPhoneNumber);

    const success = await sendOtp(fullPhoneNumber, "generate-otp-btn");

    if (success) {
      setOtpSent(true);
      setResendTimer(60); // 60 second cooldown
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  /**
   * Handle OTP input change with auto-focus
   */
  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input on entry
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle OTP input keydown for backspace navigation
   */
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle OTP paste
   */
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Focus appropriate input after paste
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  /**
   * Handle Resend OTP
   */
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setOtp(["", "", "", "", "", ""]);
    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    
    const success = await resendOtp(fullPhoneNumber, "generate-otp-btn");
    
    if (success) {
      setResendTimer(60);
      otpRefs.current[0]?.focus();
    }
  };

  /**
   * Handle Create Account - verify OTP and call register API
   */
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setApiError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Verify OTP with Firebase and get ID token
      const firebaseIdToken = await verifyOtp(otpCode);
      
      if (!firebaseIdToken) {
        setIsSubmitting(false);
        return; // Error is already set by verifyOtp
      }

      // Step 2: Call register API with verified token
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseIdToken,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          countryCode,
          mobileNumber: mobileNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Step 3: Success - store token and redirect
      console.log("Registration successful:", data);
      
      // Store the JWT token
      localStorage.setItem("token", data.token);
      
      // Optional: Store user info
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard or home
      router.push("/admin/dashboard");

    } catch (err: any) {
      console.error("Registration error:", err);
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Go back to edit form details
   */
  const handleEditDetails = () => {
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(0);
  };

  // Combined loading state
  const isLoading = loading || isSubmitting;
  const displayError = apiError || error;

  return (
    <div className="bg-white min-h-screen pt-[135px]">
      {/* Signup Form Section */}
      <section className="relative py-24 min-h-[calc(100vh-147px-446px)]">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mx-auto w-[822px] bg-white border border-[#296341] rounded-[10px] px-16 py-12">
            {/* Title */}
            <h1 className="font-['Inter'] font-bold text-[35px] text-[#296341] text-center mb-6">
              CREATE ACCOUNT
            </h1>

            {/* Subtitle */}
            <p className="font-['Inter'] font-medium text-[21px] text-black text-center mb-12">
              Welcome To Dean&apos;s Shipping Ltd. | Please Enter Your Details To Sign Up
            </p>

            {/* Error Display */}
            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center font-['Inter'] text-[16px]">
                  {displayError}
                </p>
              </div>
            )}

            {/* Form - Disabled when OTP is sent */}
            <form onSubmit={handleGenerateOTP} className="space-y-8">
              {/* First Name */}
              <div className="flex items-center gap-8">
                <label className="font-['Inter'] font-medium text-[26px] text-black w-[320px]">
                  First Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter First Name"
                  disabled={otpSent || isLoading}
                  className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="flex items-center gap-8">
                <label className="font-['Inter'] font-medium text-[26px] text-black w-[320px]">
                  Last Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Last Name"
                  disabled={otpSent || isLoading}
                  className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex items-center gap-8">
                <label className="font-['Inter'] font-medium text-[26px] text-black w-[320px]">
                  Email Address<span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  disabled={otpSent || isLoading}
                  className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="flex items-center gap-8">
                <label className="font-['Inter'] font-medium text-[26px] text-black w-[320px]">
                  Mobile Number<span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2 flex-1">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={otpSent || isLoading}
                      className="w-[74px] h-[47px] px-3 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                      <option value="+61">+61</option>
                      <option value="+81">+81</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p34f8900} fill="#585858" />
                      </svg>
                    </div>
                  </div>

                  {/* Mobile Number Input */}
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter Mobile Number"
                    disabled={otpSent || isLoading}
                    className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-[21px] h-[23px] bg-[#d9d9d9] border border-gray-400 rounded flex items-center justify-center ${otpSent ? "opacity-50" : ""}`}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      disabled={otpSent || isLoading}
                      className="sr-only"
                    />
                    {agreedToTerms && (
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4L6 11.5L2.5 8" stroke="#296341" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="font-['Inter'] font-medium text-[20px] text-black">
                    By Joining You Agree To The{" "}
                    <Link href="/terms" className="text-[#4c6aff] hover:underline">
                      Terms and Conditions
                    </Link>
                  </span>
                </label>
              </div>

              {/* Generate OTP Button - Hidden when OTP is sent */}
              {!otpSent && (
                <div className="flex justify-center pt-4">
                  <button
                    id="generate-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-[320px] h-[47px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-[25px] rounded-[5px] border border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      "Generate OTP"
                    )}
                  </button>
                </div>
              )}

              {/* Log In Link */}
              <p className="font-['Inter'] font-medium text-[20px] text-black text-center">
                Already Have An Account?{" "}
                <Link href="/login" className="text-[#4c6aff] hover:underline">
                  Log In
                </Link>
              </p>
            </form>

            {/* OTP Section - Shows after Generate OTP is clicked */}
            {otpSent && (
              <div className="mt-12 space-y-6">
                {/* OTP Sent Message */}
                <p className="text-center font-['Inter'] text-[18px] text-gray-600">
                  We&apos;ve sent a verification code to{" "}
                  <span className="font-semibold text-[#296341]">
                    {countryCode} {mobileNumber}
                  </span>
                </p>

                {/* Edit Number Link */}
                <p className="text-center">
                  <button
                    type="button"
                    onClick={handleEditDetails}
                    disabled={isLoading}
                    className="text-[#4c6aff] hover:underline font-['Inter'] text-[16px] disabled:opacity-50"
                  >
                    Edit phone number
                  </button>
                </p>

                <form onSubmit={handleCreateAccount} className="space-y-8">
                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        disabled={isLoading}
                        className="w-[60px] h-[60px] border border-[#296341] rounded-[10px] text-center font-['Inter'] font-medium text-[28px] text-[#296341] focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    ))}
                  </div>

                  {/* Resend OTP */}
                  <p className="text-center font-['Inter'] text-[16px] text-gray-600">
                    Didn&apos;t receive the code?{" "}
                    {resendTimer > 0 ? (
                      <span className="text-gray-400">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-[#4c6aff] hover:underline disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>

                  {/* Create Account Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                      className="w-[320px] h-[47px] bg-[#132540] hover:bg-[#0d1a2d] transition-colors text-white font-['Inter'] font-medium text-[25px] rounded-[5px] border border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isSubmitting ? "Creating Account..." : "Verifying..."}
                        </>
                      ) : (
                        "CREATE ACCOUNT"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}