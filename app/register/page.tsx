"use client";

import { useState } from "react";
import { Link } from "lucide-react";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import svgPaths from "../imports/svg-vsq6m84fvq";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleGenerateOTP = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Generate OTP for:", { firstName, lastName, email, countryCode, mobileNumber });
    setOtpSent(true);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create account with OTP:", otp.join(""));
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

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
              Welcome To Dean's Shipping Ltd. | Please Enter Your Details To Sign Up
            </p>

            {/* Form */}
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
                  className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
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
                  className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
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
                  className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
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
                      className="w-[74px] h-[47px] px-3 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
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
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter Mobile Number"
                    className="flex-1 h-[47px] px-4 border border-black rounded-[5px] font-['Inter'] font-light text-[20px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    required
                  />
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center gap-4 pt-4">
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
                        <path d="M13.5 4L6 11.5L2.5 8" stroke="#296341" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

              {/* Log In Link */}
              <p className="font-['Inter'] font-medium text-[20px] text-black text-center">
                Already Have An Account?{" "}
                <Link to="/login" className="text-[#4c6aff] hover:underline">
                  Log In
                </Link>
              </p>
            </form>

            {/* OTP Section - Shows after Generate OTP is clicked */}
            {otpSent && (
              <form onSubmit={handleCreateAccount} className="mt-12 space-y-8">
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-[60px] h-[60px] border border-[#296341] rounded-[10px] text-center font-['Inter'] font-medium text-[28px] text-[#296341] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    />
                  ))}
                </div>

                {/* Create Account Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    className="w-[320px] h-[47px] bg-[#132540] hover:bg-[#0d1a2d] transition-colors text-white font-['Inter'] font-medium text-[25px] rounded-[5px] border border-black"
                  >
                    CREATE ACCOUNT
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
