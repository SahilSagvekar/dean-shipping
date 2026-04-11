"use client";

import { useState } from "react";
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
    <div className="bg-white min-h-screen pt-[80px] md:pt-[135px]">
      {/* Hero Section */}
      <section className="relative bg-[#296341] py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <h1 className="font-['Inter'] font-bold text-3xl md:text-[48px] text-white text-center mb-4">
            Contact Us
          </h1>
          <p className="font-['Inter'] font-normal text-lg md:text-[24px] text-white text-center max-w-[800px] mx-auto">
            Have questions or need assistance? We're here to help. Get in touch with us today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            {/* Contact Form */}
            <div className="bg-white border-2 md:border-3 border-[#296341] rounded-xl md:rounded-[10px] px-6 md:px-12 py-8 md:py-12 shadow-sm">
              <h2 className="font-['Inter'] font-semibold text-2xl md:text-[32px] text-[#296341] mb-6 md:mb-8 text-center md:text-left">
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {[
                  { label: "Name", name: "name", type: "text", placeholder: "Enter your name", required: true },
                  { label: "Email", name: "email", type: "email", placeholder: "Enter your email", required: true },
                  { label: "Phone", name: "phone", type: "tel", placeholder: "Enter your phone number", required: false },
                  { label: "Subject", name: "subject", type: "text", placeholder: "Enter subject", required: true }
                ].map((field, idx) => (
                  <div key={idx}>
                    <label className="block font-['Inter'] font-medium text-base md:text-[20px] text-black mb-2 md:mb-3">
                      {field.label}{field.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full h-11 md:h-[52px] px-4 border border-black rounded-[5px] font-['Inter'] font-normal text-base md:text-[18px] text-[#585858] placeholder:text-[#585858]/50 focus:outline-none focus:ring-2 focus:ring-[#296341]"
                      required={field.required}
                    />
                  </div>
                ))}

                <div>
                  <label className="block font-['Inter'] font-medium text-base md:text-[20px] text-black mb-2 md:mb-3">
                    Message<span className="text-red-600 ml-1">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message"
                    rows={4}
                    className="w-full px-4 py-3 border border-black rounded-[5px] font-['Inter'] font-normal text-base md:text-[18px] text-[#585858] placeholder:text-[#585858]/50 focus:outline-none focus:ring-2 focus:ring-[#296341] resize-none"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full h-12 md:h-[52px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-xl md:text-[25px] rounded-[10px] active:scale-[0.98]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h2 className="font-['Inter'] font-semibold text-2xl md:text-[32px] text-[#296341] mb-4 md:mb-8">
                  Get in touch
                </h2>
                <p className="font-['Inter'] font-normal text-base md:text-[20px] text-black leading-relaxed">
                  We're here to assist you with all your shipping needs. Reach out to us through any of the channels below.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {/* Email Card */}
                <div className="bg-white border-2 border-[#296341] rounded-xl px-6 md:px-8 py-6 hover:bg-emerald-50/30 transition-colors shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 mt-1">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                        <path d={svgPaths.p995f500} fill="#296341" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-['Inter'] font-semibold text-xl md:text-[24px] text-[#296341] mb-1 md:mb-2">
                        Email
                      </h3>
                      <a
                        href="mailto:contact@contact.com"
                        className="font-['Inter'] font-normal text-base md:text-[20px] text-black hover:text-[#296341] transition-colors break-words"
                      >
                        contact@contact.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-white border-2 border-[#296341] rounded-xl px-6 md:px-8 py-6 hover:bg-emerald-50/30 transition-colors shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 mt-1">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                        <g>
                          <path d={svgPaths.pe263670} fill="#296341" />
                          <path d={svgPaths.p5e7740} fill="#296341" />
                        </g>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-['Inter'] font-semibold text-xl md:text-[24px] text-[#296341] mb-1 md:mb-2">
                        Phone
                      </h3>
                      <p className="font-['Inter'] font-normal text-base md:text-[20px] text-black">
                        +1 98765 43210
                      </p>
                    </div>
                  </div>
                </div>

                {/* Office Locations Card */}
                <div className="bg-white border-2 border-[#296341] rounded-xl px-6 md:px-8 py-6 col-span-1 md:col-span-2 lg:col-span-1 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 mt-1">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#296341" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-['Inter'] font-semibold text-xl md:text-[24px] text-[#296341] mb-6">
                        Office Locations
                      </h3>
                      <div className="space-y-6">
                        {[
                          { title: "Nassau, The Bahamas", detail: "Parkgate Road, P.O. Box EE-17318", call: "1.242.394.0245/6" },
                          { title: "Potter's Cay", call: "1.242.601.5121" },
                          { title: "Abaco, The Bahamas", detail: "Queen's Highway (at Port)", call: "1.242.367.2389" }
                        ].map((loc, idx) => (
                          <div key={idx} className="border-b border-emerald-50 pb-4 last:border-0 last:pb-0">
                            <h4 className="font-['Inter'] font-semibold text-lg md:text-[20px] text-black mb-1">
                              {loc.title}
                            </h4>
                            {loc.detail && <p className="font-['Inter'] font-normal text-sm md:text-[18px] text-black leading-relaxed opacity-70">{loc.detail}</p>}
                            <p className="font-['Inter'] font-bold text-sm md:text-[18px] text-[#296341] mt-1">
                              CALL: {loc.call}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-[#f5f5f5] border border-[#296341] rounded-xl px-6 md:px-8 py-6 mt-8">
                <h3 className="font-['Inter'] font-semibold text-xl md:text-[24px] text-[#296341] mb-4">
                  Business Hours
                </h3>
                <div className="space-y-3">
                  {[
                    { day: "Monday - Friday", hours: "8:00 AM - 5:00 PM" },
                    { day: "Saturday", hours: "9:00 AM - 1:00 PM" },
                    { day: "Sunday", hours: "Closed" }
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm md:text-[18px]">
                      <span className="font-['Inter'] font-normal text-black opacity-70">{row.day}</span>
                      <span className="font-['Inter'] font-semibold text-black">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12 md:mt-16">
            <h2 className="font-['Inter'] font-semibold text-2xl md:text-[32px] text-[#296341] mb-6 text-center">
              Find Us
            </h2>
            <div className="bg-white border-2 border-[#296341] rounded-xl overflow-hidden shadow-sm">
              <iframe
                src="https://maps.google.com/maps?q=Parkgate+Road,+Nassau,+The+Bahamas&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[300px] md:h-[450px]"
                title="Dean's Shipping Ltd Location - Nassau, The Bahamas"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Parkgate+Road+Nassau+Bahamas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#296341] hover:bg-[#1e4d30] text-white font-['Inter'] font-medium text-base md:text-lg px-6 py-3 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                </svg>
                Get Directions
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Potter's+Cay+Nassau+Bahamas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border-2 border-[#296341] text-[#296341] hover:bg-[#296341] hover:text-white font-['Inter'] font-medium text-base md:text-lg px-6 py-3 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                </svg>
                Potter's Cay Location
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}