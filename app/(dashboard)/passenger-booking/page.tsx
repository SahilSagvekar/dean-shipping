"use client";

import { useState } from 'react';
import {
  Menu,
  Camera,
  Paperclip,
  Plus,
  Minus,
  ChevronDown,
  MapPin,
  Baby,
  User,
  Users,
  ArrowRight
} from 'lucide-react';
import imgBookingIllustration from "@/app/assets/cfa31b3ce2eb14a48a0ef2738b4164b16c74ab53.png";
import imgDriversLicense from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// Import Sidebar pieces
import { SidebarProvider, Sidebar, HamburgerButton } from '@/components/sidebar';

function PassengerBookingContent() {
  const [infantCount, setInfantCount] = useState(0);
  const [childCount, setChildCount] = useState(1);
  const [adultCount, setAdultCount] = useState(2);

  const [name, setName] = useState("Jane    Robin    Forbes");
  const [mail, setMail] = useState("Janeforbes01@demo.com");
  const [contact, setContact] = useState("+1 1234 1234");
  const [bookingDate, setBookingDate] = useState("20 / 12 / 2025");
  const [fromLocation, setFromLocation] = useState("NAS");
  const [toLocation, setToLocation] = useState("MAH");
  const [idType, setIdType] = useState("DRIVER'S LICENCE");
  const [remark, setRemark] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PAID");

  return (
    <div className="bg-white min-h-screen flex flex-col pt-[80px]">
      <Sidebar logoSrc={imgLogo.src} />

      {/* Header with Hamburger */}
      <div className="px-8 py-4">
        <HamburgerButton iconSize={48} />
      </div>

      {/* Hero Illustration */}
      <div className="flex justify-center mb-8 px-8">
        <img
          src={imgBookingIllustration.src}
          alt="Passenger Booking Illustration"
          className="w-full max-w-[800px] h-auto object-contain"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-16 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left Column: Form Details */}
          <div className="lg:w-[60%] space-y-8">
            {/* Title Section */}
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-black tracking-wide">
                <span className="border-b-4 border-black pb-1">PASSENGER</span> BOOKING
              </h1>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-800">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
              />
            </div>

            {/* Mail Field */}
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-800">Mail</label>
              <input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
              />
            </div>

            {/* Contact and Date Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-800">Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-800">Booking Date</label>
                <input
                  type="text"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
                />
              </div>
            </div>

            {/* Passenger Counter Section */}
            <div className="space-y-4 pt-4">
              {/* Infant */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <Baby className="w-8 h-8 text-[#296341]" />
                  <span className="text-[20px] font-bold text-gray-800">Infant (0 - 2 yr old)</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-[150px]">
                  <button onClick={() => setInfantCount(Math.max(0, infantCount - 1))} className="flex-1 py-3 flex items-center justify-center hover:bg-gray-50 text-gray-400">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-[50px] text-center text-[22px] font-black text-[#296341]">{infantCount}</span>
                  <button onClick={() => setInfantCount(infantCount + 1)} className="flex-1 py-3 flex items-center justify-center hover:bg-gray-50 text-[#296341]">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Child */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <Users className="w-8 h-8 text-[#296341]" />
                  <span className="text-[20px] font-bold text-gray-800">Child (3 - 13 yr old)</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-[150px]">
                  <button onClick={() => setChildCount(Math.max(0, childCount - 1))} className="flex-1 py-3 flex items-center justify-center hover:bg-gray-50 text-gray-400">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-[50px] text-center text-[22px] font-black text-[#296341]">{childCount}</span>
                  <button onClick={() => setChildCount(childCount + 1)} className="flex-1 py-3 flex items-center justify-center hover:bg-gray-50 text-[#296341]">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Adult */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <User className="w-8 h-8 text-[#296341]" />
                  <span className="text-[20px] font-bold text-gray-800">Adult (13+ yr old)</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-[150px]">
                  <button onClick={() => setAdultCount(Math.max(0, adultCount - 1))} className="flex-1 py-3 flex items-center justify-center hover:bg-gray-50 text-gray-400">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-[50px] text-center text-[22px] font-black text-[#296341]">{adultCount}</span>
                  <button onClick={() => setAdultCount(adultCount + 1)} className="flex-1 py-3 flex items-center justify-center hover:bg-gray-50 text-[#296341]">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* From / To Location */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" /> From
                </label>
                <div className="relative">
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold"
                  >
                    <option value="NAS">NAS</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" /> To
                </label>
                <div className="relative">
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold"
                  >
                    <option value="MAH">MAH</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
            </div>

            {/* ID Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-[18px] font-bold text-gray-600">ID Type :</span>
                <div className="relative flex-1 max-w-[400px]">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] font-bold text-[18px]"
                  >
                    <option value="DRIVER'S LICENCE">DRIVER'S LICENCE</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex flex-col gap-4 mt-2">
                  <Camera className="w-10 h-10 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
                  <Paperclip className="w-10 h-10 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
                </div>
                <div className="flex gap-4 flex-1 items-center">
                  <div className="flex-[1.5] rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-md">
                    <img src={imgDriversLicense.src} alt="ID Large" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgDriversLicense.src} className="w-full h-full object-cover" /></div>
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgDriversLicense.src} className="w-full h-full object-cover" /></div>
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgDriversLicense.src} className="w-full h-full object-cover" /></div>
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 relative group cursor-pointer">
                      <img src={imgDriversLicense.src} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[24px] font-bold font-['Inter'] group-hover:bg-black/40 transition-all">+2</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button className="bg-[#296341]/80 hover:bg-[#296341] text-white px-10 py-3 rounded-lg font-bold text-[20px] transition-all shadow-md active:scale-95 flex items-center gap-3">
                  <Plus className="w-6 h-6" /> ADD LUGGAGE
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="lg:w-[40%]">
            <div className="bg-[#c2dccf] rounded-[40px] p-8 lg:p-10 shadow-xl border-b-[12px] border-[#296341]/20 relative">

              {/* Contact Details in summary */}
              <div className="space-y-6 mb-12">
                <h3 className="text-[22px] font-bold text-[#244234] border-b border-[#244234]/10 pb-2">Contact Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <label className="text-[16px] font-bold text-gray-500 w-16">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 h-[45px] bg-white rounded-lg px-4 shadow-sm outline-none font-bold" />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="text-[16px] font-bold text-gray-500 w-16">Mail</label>
                    <input value={mail} onChange={(e) => setMail(e.target.value)} className="flex-1 h-[45px] bg-white rounded-lg px-4 shadow-sm outline-none font-bold" />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="text-[16px] font-bold text-gray-500 w-16">Contact</label>
                    <input value={contact} onChange={(e) => setContact(e.target.value)} className="flex-1 h-[45px] bg-white rounded-lg px-4 shadow-sm outline-none font-bold" />
                  </div>
                </div>
              </div>

              {/* Total Amount Grid */}
              <div className="space-y-8 pb-32">
                <h3 className="text-center font-black text-[20px] tracking-widest text-[#244234]">TOTAL AMOUNT</h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase">Passenger</p>
                    <p className="text-[22px] font-black">{infantCount + childCount + adultCount}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase">Invoice no.</p>
                    <p className="text-[22px] font-black">#1234567</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase">Invoice Date</p>
                    <p className="text-[22px] font-black">22/12/25</p>
                  </div>
                </div>

                {/* Location row */}
                <div className="space-y-4">
                  <p className="text-[12px] font-bold text-gray-400 uppercase">Location</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[24px] font-black flex items-center gap-3">NAS <ArrowRight className="text-[#296341]" /> MAH</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => setPaymentStatus("PAID")}
                        className={`px-4 py-1 rounded-full font-bold text-sm shadow-sm transition-all ${paymentStatus === 'PAID' ? 'bg-[#2ecc71] text-white' : 'bg-white text-gray-400'}`}
                      >
                        PAID
                      </button>
                      <button
                        onClick={(e) => setPaymentStatus("UNPAID")}
                        className={`px-4 py-1 rounded-full font-bold text-sm transition-all ${paymentStatus === 'UNPAID' ? 'bg-white text-gray-800 border border-gray-200' : 'bg-transparent text-gray-400'}`}
                      >
                        UNPAID
                      </button>
                    </div>
                  </div>
                </div>

                <textarea
                  placeholder="Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full h-[100px] bg-gray-100/50 rounded-2xl p-4 shadow-inner outline-none font-bold text-[#244234] resize-none"
                />
              </div>

              {/* Overlapping Card */}
              <div className="absolute left-[10%] right-[10%] -bottom-16 bg-white rounded-[32px] p-8 shadow-2xl border border-gray-50 flex flex-col items-center">
                <p className="text-[18px] font-bold text-gray-400 tracking-wider">Total Amount</p>
                <p className="text-[48px] font-black text-black leading-tight">$155.60</p>
                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">(Including 12% VAT)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-32">
              <button className="w-full bg-[#132540] py-5 rounded-2xl text-white text-[24px] font-black tracking-widest hover:bg-[#1a3254] transition-all shadow-lg active:scale-95">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-10 mt-12">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[80px]" />
          </div>
          <div className="text-white text-[32px] font-semibold">
            Freight Agent | <span className="font-normal">Smith Frank</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PassengerBooking() {
  return (
    <SidebarProvider>
      <PassengerBookingContent />
    </SidebarProvider>
  );
}
