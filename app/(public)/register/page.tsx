"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import svgPaths from "@/app/imports/svg-vsq6m84fvq";

export default function Signup() {
  const router = useRouter();
  const { sendOtp, verifyOtp, resendOtp, clearError, loading, error } = usePhoneAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);

  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (apiError) setApiError(null);
    if (error) clearError();
  }, [firstName, lastName, email, mobileNumber, otp]);

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

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;
    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    const success = await sendOtp(fullPhoneNumber, "generate-otp-btn");
    if (success) {
      setOtpSent(true);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => { if (i < 6) newOtp[i] = char; });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

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
      const firebaseIdToken = await verifyOtp(otpCode);
      if (!firebaseIdToken) {
        setIsSubmitting(false);
        return;
      }
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
      if (!response.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDetails = () => {
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(0);
  };

  const isLoading = loading || isSubmitting;
  const displayError = apiError || error;

  return (
    <div className="bg-white min-h-screen pt-[100px] md:pt-[135px]">
      <section className="relative py-12 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="mx-auto w-full max-w-[822px] bg-white border-2 md:border-3 border-[#296341] rounded-xl md:rounded-[10px] px-6 md:px-16 py-10 md:py-12 shadow-sm">
            <h1 className="font-['Inter'] font-bold text-2xl md:text-[35px] text-[#296341] text-center mb-6">
              CREATE ACCOUNT
            </h1>

            <p className="font-['Inter'] font-medium text-base md:text-[21px] text-black text-center mb-8 md:mb-12">
              Welcome To Dean&apos;s Shipping Ltd. | Please Enter Your Details To Sign Up
            </p>

            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center font-medium text-sm md:text-base">
                  {displayError}
                </p>
              </div>
            )}

            <form onSubmit={handleGenerateOTP} className="space-y-6 md:space-y-8">
              {[
                { label: "First Name", value: firstName, setter: setFirstName, type: "text", placeholder: "Enter First Name" },
                { label: "Last Name", value: lastName, setter: setLastName, type: "text", placeholder: "Enter Last Name" },
                { label: "Email Address", value: email, setter: setEmail, type: "email", placeholder: "Enter Email Address" }
              ].map((field, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <label className="font-['Inter'] font-medium text-xl md:text-[26px] text-black sm:w-[280px]">
                    {field.label}<span className="text-red-600">*</span>
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    disabled={otpSent || isLoading}
                    className="flex-1 h-12 md:h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-lg md:text-[20px] text-[#585858] placeholder:text-[#585858]/50 focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100"
                    required
                  />
                </div>
              ))}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                <label className="font-['Inter'] font-medium text-xl md:text-[26px] text-black sm:w-[280px]">
                  Mobile Number<span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2 flex-1">
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={otpSent || isLoading}
                      className="w-[74px] h-[47px] px-2 border border-black rounded-[5px] font-['Inter'] font-light text-lg md:text-[20px] text-[#585858] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100 bg-white"
                    >
                      {["+1", "+44", "+91", "+61", "+81"].map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p34f8900} fill="#585858" />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter Mobile Number"
                    disabled={otpSent || isLoading}
                    className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-lg md:text-[20px] text-[#585858] placeholder:text-[#585858]/50 focus:outline-none focus:ring-2 focus:ring-[#296341] disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-1 w-[21px] h-[23px] flex-shrink-0 bg-[#d9d9d9] border border-gray-400 rounded flex items-center justify-center transition-colors ${otpSent ? "opacity-50" : "group-hover:border-[#296341]"}`}>
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
                  <span className="font-['Inter'] font-medium text-sm md:text-[20px] text-black">
                    By Joining You Agree To The{" "}
                    <Link href="/terms" className="text-[#4c6aff] hover:underline">Terms and Conditions</Link>
                  </span>
                </label>
              </div>

              {!otpSent && (
                <div className="flex justify-center pt-4">
                  <button
                    id="generate-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full max-w-[320px] h-[47px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-xl md:text-[25px] rounded-[5px] border border-black active:scale-95 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? "Sending OTP..." : "Generate OTP"}
                  </button>
                </div>
              )}

              <p className="font-['Inter'] font-medium text-lg md:text-[20px] text-black text-center">
                Already Have An Account? <Link href="/login" className="text-[#4c6aff] hover:underline">Log In</Link>
              </p>
            </form>

            {otpSent && (
              <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-center font-['Inter'] text-base md:text-[18px] text-gray-600">
                  Verification code sent to <span className="font-semibold text-[#296341]">{countryCode} {mobileNumber}</span>
                </p>
                <div className="text-center">
                  <button onClick={handleEditDetails} className="text-[#4c6aff] hover:underline font-['Inter'] text-sm md:text-[16px]">Edit phone number</button>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-8">
                  <div className="flex justify-center flex-wrap gap-2 md:gap-3">
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
                        className="w-12 h-12 md:w-[60px] md:h-[60px] border border-[#296341] rounded-[10px] text-center font-['Inter'] font-medium text-xl md:text-[28px] text-[#296341] focus:ring-2 focus:ring-[#296341] focus:outline-none"
                      />
                    ))}
                  </div>

                  <p className="text-center font-['Inter'] text-sm md:text-[16px] text-gray-600">
                    Didn&apos;t receive code? {resendTimer > 0 ? `Resend in ${resendTimer}s` : <button onClick={handleResendOTP} className="text-[#4c6aff] hover:underline">Resend OTP</button>}
                  </p>

                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                      className="w-full max-w-[320px] h-[47px] bg-[#132540] hover:bg-[#0d1a2d] transition-colors text-white font-['Inter'] font-medium text-xl md:text-[25px] rounded-[5px] border border-black active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? "PROCESING..." : "CREATE ACCOUNT"}
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