"use client";

import { useState } from "react";
// import { Link } from "react-router";
import { Link } from "lucide-react";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import svgPaths from "../imports/svg-qkcs8auxd4";

export default function Login() {
  const [loginType, setLoginType] = useState<"user" | "agent" | "admin">("user");
  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Generate OTP for:", { loginType, countryCode, mobileNumber });
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Login Form Section */}
      <section className="relative py-24 min-h-[calc(100vh-147px-446px)]">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mx-auto w-[822px] bg-white border-3 border-[#296341] rounded-[10px] px-16 py-12">
            {/* Title */}
            <h1 className="font-['Inter'] font-bold text-[35px] text-[#296341] text-center mb-6">
              Log In
            </h1>

            {/* Subtitle */}
            <p className="font-['Inter'] font-medium text-[21px] text-black text-center mb-12">
              Welcome To Dean's Shipping Ltd. | Please Enter Your Details To
              Login
            </p>

            {/* Login Type Selector */}
            <div className="flex items-center justify-center gap-12 mb-16">
              {/* User Login */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-[27px] h-[25px]">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 27 25"
                  >
                    <path
                      d={svgPaths.p244c1800}
                      stroke="#296341"
                      strokeWidth="1"
                    />
                  </svg>
                  {loginType === "user" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[11px] h-[10px]">
                      <svg
                        className="w-full h-full"
                        fill="none"
                        viewBox="0 0 11 10"
                      >
                        <ellipse
                          cx="5.5"
                          cy="5"
                          fill="#296341"
                          rx="5.5"
                          ry="5"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="radio"
                  name="loginType"
                  value="user"
                  checked={loginType === "user"}
                  onChange={() => setLoginType("user")}
                  className="sr-only"
                />
                <span className="font-['Inter'] font-medium text-[28px] text-[#296341]">
                  User Login
                </span>
              </label>

              {/* Agent Login */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-[27px] h-[25px]">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 27 25"
                  >
                    <path
                      d={svgPaths.p244c1800}
                      stroke="#296341"
                      strokeWidth="1"
                    />
                  </svg>
                  {loginType === "agent" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[11px] h-[10px]">
                      <svg
                        className="w-full h-full"
                        fill="none"
                        viewBox="0 0 11 10"
                      >
                        <ellipse
                          cx="5.5"
                          cy="5"
                          fill="#296341"
                          rx="5.5"
                          ry="5"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="radio"
                  name="loginType"
                  value="agent"
                  checked={loginType === "agent"}
                  onChange={() => setLoginType("agent")}
                  className="sr-only"
                />
                <span className="font-['Inter'] font-medium text-[28px] text-[#296341]">
                  Agent Login
                </span>
              </label>

              {/* Admin Login */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-[27px] h-[25px]">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 27 25"
                  >
                    <path
                      d={svgPaths.p244c1800}
                      stroke="#296341"
                      strokeWidth="1"
                    />
                  </svg>
                  {loginType === "admin" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[11px] h-[10px]">
                      <svg
                        className="w-full h-full"
                        fill="none"
                        viewBox="0 0 11 10"
                      >
                        <ellipse
                          cx="5.5"
                          cy="5"
                          fill="#296341"
                          rx="5.5"
                          ry="5"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="radio"
                  name="loginType"
                  value="admin"
                  checked={loginType === "admin"}
                  onChange={() => setLoginType("admin")}
                  className="sr-only"
                />
                <span className="font-['Inter'] font-medium text-[28px] text-[#296341]">
                  Admin Login
                </span>
              </label>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mobile Number Field */}
              <div>
                <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                  Mobile Number<span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[74px] h-[47px] px-3 border border-black rounded-[5px] font-['Inter'] font-light text-[25px] text-[#585858] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 rotate-180"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path d={svgPaths.p34f8900} fill="#585858" />
                      </svg>
                    </div>
                  </div>

                  {/* Mobile Number Input */}
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter Mobile Number"
                    className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[25px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-[21px] h-[23px] bg-[#d9d9d9] border border-gray-400 rounded flex items-center justify-center">
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
                  <span className="font-['Inter'] font-medium text-[20px] text-black">
                    By Joining You Agree To The{" "}
                    <a href="#terms" className="text-[#4c6aff] hover:underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Generate OTP Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="w-[320px] h-[47px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-[25px] rounded-[5px] border border-black"
                >
                  Generate OTP
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="font-sans font-medium text-[20px] text-black text-center">
                Don't Have An Account?{" "}
                <a
                  href="/register"
                  className="text-[#4c6aff] hover:underline"
                >   
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
