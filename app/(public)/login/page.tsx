"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import svgPaths from "../../imports/svg-qkcs8auxd4";

export default function Login() {
  const router = useRouter();
  const { sendOtp, verifyOtp, loading, error } = usePhoneAuth();

  const [loginType, setLoginType] = useState<"user" | "agent" | "admin">("user");
  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!mobileNumber) {
      setApiError("Please enter your mobile number");
      return;
    }

    if (!agreedToTerms) {
      setApiError("Please agree to the terms and conditions");
      return;
    }

    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    const success = await sendOtp(fullPhoneNumber, "generate-otp-button");

    if (success) {
      setShowOtpInput(true);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!otp || otp.length !== 6) {
      setApiError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const token = await verifyOtp(otp);

      if (!token) {
        setApiError("Invalid OTP. Please try again.");
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseIdToken: token,
          loginType,
          mobileNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      switch (data.user.role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "AGENT":
          router.push("/agent/dashboard");
          break;
        default:
          router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setApiError(err.message || "Login failed. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    setApiError(null);
    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    await sendOtp(fullPhoneNumber, "generate-otp-button");
  };

  const renderRadioButton = (type: "user" | "agent" | "admin", label: string) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative w-6 h-6 md:w-[27px] md:h-[25px] flex-shrink-0">
        <svg className="w-full h-full" fill="none" viewBox="0 0 27 25">
          <path d={svgPaths.p244c1800} stroke="#296341" strokeWidth="1" />
        </svg>
        {loginType === type && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-[11px] md:h-[10px]">
            <svg className="w-full h-full" fill="none" viewBox="0 0 11 10">
              <ellipse cx="5.5" cy="5" fill="#296341" rx="5.5" ry="5" />
            </svg>
          </div>
        )}
      </div>
      <input
        type="radio"
        name="loginType"
        value={type}
        checked={loginType === type}
        onChange={() => setLoginType(type)}
        className="sr-only"
      />
      <span className="font-['Inter'] font-medium text-lg md:text-[28px] text-[#296341] group-hover:opacity-80 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </label>
  );

  return (
    <div className="bg-white min-h-screen pt-[100px] md:pt-[135px]">
      <section className="relative py-12 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="mx-auto w-full max-w-[822px] bg-white border-2 md:border-3 border-[#296341] rounded-xl md:rounded-[10px] px-6 md:px-16 py-10 md:py-12 shadow-sm">
            <h1 className="font-['Inter'] font-bold text-2xl md:text-[35px] text-[#296341] text-center mb-6">
              {showOtpInput ? "Enter OTP" : "Log In"}
            </h1>

            <p className="font-['Inter'] font-medium text-base md:text-[21px] text-black text-center mb-8 md:mb-12">
              {showOtpInput
                ? `Enter the 6-digit code sent to ${countryCode}${mobileNumber}`
                : "Welcome To Dean's Shipping Ltd. | Please Enter Your Details To Login"}
            </p>

            {(error || apiError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center font-medium text-sm md:text-base">
                  {error || apiError}
                </p>
              </div>
            )}

            {!showOtpInput ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-12 mb-10 md:mb-16">
                  {renderRadioButton("user", "User Login")}
                  {renderRadioButton("agent", "Agent Login")}
                  {renderRadioButton("admin", "Admin Login")}
                </div>

                <form onSubmit={handleGenerateOTP} className="space-y-6 md:space-y-8">
                  <div>
                    <label className="block font-['Inter'] font-medium text-xl md:text-[30px] text-black mb-4">
                      Mobile Number<span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-[74px] h-[47px] px-2 border border-black rounded-[5px] font-['Inter'] font-light text-xl md:text-[25px] text-[#585858] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341] bg-white"
                        >
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+91">+91</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-3 h-3 md:w-4 md:h-4 rotate-180" fill="none" viewBox="0 0 16 16">
                            <path d={svgPaths.p34f8900} fill="#585858" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter Mobile Number"
                        className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-xl md:text-[25px] text-[#585858] placeholder:text-[#585858]/50 focus:outline-none focus:ring-2 focus:ring-[#296341]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="mt-1 w-[21px] h-[23px] flex-shrink-0 bg-[#d9d9d9] border border-gray-400 rounded flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="sr-only"
                        />
                        {agreedToTerms && (
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M13.5 4L6 11.5L2.5 8"
                              stroke="#296341"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-['Inter'] font-medium text-sm md:text-[20px] text-black">
                        {"By Joining You Agree To The "}
                        <a href="/terms" className="text-[#4c6aff] hover:underline">
                          Terms and Conditions
                        </a>
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      id="generate-otp-button"
                      type="submit"
                      disabled={loading}
                      className="w-full max-w-[320px] h-[47px] bg-[#296341] hover:bg-[#1e4d30] disabled:bg-gray-400 transition-colors text-white font-['Inter'] font-medium text-xl md:text-[25px] rounded-[5px] border border-black active:scale-95"
                    >
                      {loading ? "Sending..." : "Generate OTP"}
                    </button>
                  </div>

                  <p className="font-sans font-medium text-lg md:text-[20px] text-black text-center">
                    {"Don't Have An Account? "}
                    <a href="/register" className="text-[#4c6aff] hover:underline">
                      Sign up
                    </a>
                  </p>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6 md:space-y-8">
                <div>
                  <label className="block font-['Inter'] font-medium text-xl md:text-[30px] text-black mb-4">
                    Enter OTP<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-xl md:text-[25px] text-[#585858] placeholder:text-[#585858]/50 focus:outline-none focus:ring-2 focus:ring-[#296341] text-center tracking-[0.2em] md:tracking-[0.5em]"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full max-w-[320px] h-[47px] bg-[#296341] hover:bg-[#1e4d30] disabled:bg-gray-400 transition-colors text-white font-['Inter'] font-medium text-xl md:text-[25px] rounded-[5px] border border-black active:scale-95"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="font-['Inter'] font-medium text-base md:text-[18px] text-[#4c6aff] hover:underline disabled:text-gray-400"
                  >
                    Resend OTP
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp("");
                      setApiError(null);
                    }}
                    className="font-['Inter'] font-medium text-base md:text-[18px] text-gray-600 hover:underline"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}