"use client";

import { useState } from "react";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import svgPaths from "@/app/imports/svg-pjl233zy3t";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    alert("Thank you for contacting us! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* <Header /> */}

      {/* Hero Section */}
      <section className="relative bg-[#296341] py-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <h1 className="font-['Inter'] font-bold text-[48px] text-white text-center mb-4">
            Contact Us
          </h1>
          <p className="font-['Inter'] font-normal text-[24px] text-white text-center max-w-[800px] mx-auto">
            Have questions or need assistance? We're here to help. Get in touch with us today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-24">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white border-3 border-[#296341] rounded-[10px] px-12 py-12">
              <h2 className="font-['Inter'] font-semibold text-[32px] text-[#296341] mb-8">
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[20px] text-black mb-3">
                    Name<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full h-[52px] px-4 border border-black rounded-[5px] font-['Inter'] font-normal text-[18px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[20px] text-black mb-3">
                    Email<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full h-[52px] px-4 border border-black rounded-[5px] font-['Inter'] font-normal text-[18px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[20px] text-black mb-3">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full h-[52px] px-4 border border-black rounded-[5px] font-['Inter'] font-normal text-[18px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[20px] text-black mb-3">
                    Subject<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter subject"
                    className="w-full h-[52px] px-4 border border-black rounded-[5px] font-['Inter'] font-normal text-[18px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[20px] text-black mb-3">
                    Message<span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message"
                    rows={6}
                    className="w-full px-4 py-3 border border-black rounded-[5px] font-['Inter'] font-normal text-[18px] text-[#585858] placeholder:text-[#585858] focus:outline-none focus:ring-2 focus:ring-[#296341] resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full h-[52px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-[25px] rounded-[10px]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-['Inter'] font-semibold text-[32px] text-[#296341] mb-8">
                  Get in touch
                </h2>
                <p className="font-['Inter'] font-normal text-[20px] text-black leading-relaxed mb-12">
                  We're here to assist you with all your shipping needs. Reach out to us through any of the channels below.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                {/* Email Card */}
                <div className="bg-white border-2 border-[#296341] rounded-[10px] px-8 py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-[40px] h-[40px] flex-shrink-0 mt-1">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p995f500} fill="#296341" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-['Inter'] font-semibold text-[24px] text-[#296341] mb-2">
                        Email
                      </h3>
                      <a 
                        href="mailto:contact@contact.com" 
                        className="font-['Inter'] font-normal text-[20px] text-black hover:text-[#296341] transition-colors"
                      >
                        contact@contact.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-white border-2 border-[#296341] rounded-[10px] px-8 py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-[40px] h-[40px] flex-shrink-0 mt-1">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                        <g>
                          <path d={svgPaths.pe263670} fill="#296341" />
                          <path d={svgPaths.p5e7740} fill="#296341" />
                        </g>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-['Inter'] font-semibold text-[24px] text-[#296341] mb-2">
                        Phone
                      </h3>
                      <p className="font-['Inter'] font-normal text-[20px] text-black">
                        +1 98765 43210
                      </p>
                    </div>
                  </div>
                </div>

                {/* Office Locations Card */}
                <div className="bg-white border-2 border-[#296341] rounded-[10px] px-8 py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-[40px] h-[40px] flex-shrink-0 mt-1">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#296341"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-['Inter'] font-semibold text-[24px] text-[#296341] mb-4">
                        Office Locations
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-['Inter'] font-semibold text-[20px] text-black">
                            Nassau, The Bahamas
                          </h4>
                          <p className="font-['Inter'] font-normal text-[18px] text-black leading-relaxed">
                            Parkgate Road, P.O. Box EE-17318<br />
                            CALL: 1.242.394.0245/6
                          </p>
                        </div>
                        <div>
                          <h4 className="font-['Inter'] font-semibold text-[20px] text-black">
                            Potter's Cay
                          </h4>
                          <p className="font-['Inter'] font-normal text-[18px] text-black">
                            CALL: 1.242.601.5121
                          </p>
                        </div>
                        <div>
                          <h4 className="font-['Inter'] font-semibold text-[20px] text-black">
                            Abaco, The Bahamas
                          </h4>
                          <p className="font-['Inter'] font-normal text-[18px] text-black leading-relaxed">
                            Queen's Highway (at Port)<br />
                            CALL: 1.242.367.2389
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-[#f5f5f5] border border-[#296341] rounded-[10px] px-8 py-6 mt-8">
                <h3 className="font-['Inter'] font-semibold text-[24px] text-[#296341] mb-4">
                  Business Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-['Inter'] font-normal text-[18px] text-black">Monday - Friday</span>
                    <span className="font-['Inter'] font-medium text-[18px] text-black">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Inter'] font-normal text-[18px] text-black">Saturday</span>
                    <span className="font-['Inter'] font-medium text-[18px] text-black">9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Inter'] font-normal text-[18px] text-black">Sunday</span>
                    <span className="font-['Inter'] font-medium text-[18px] text-black">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  );
}
