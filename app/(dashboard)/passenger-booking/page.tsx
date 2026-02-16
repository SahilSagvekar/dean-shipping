"use client";

import { useState } from 'react';
import {
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Illustration */}
      <div className="flex justify-center mb-6 md:mb-8 px-4 sm:px-8">
        <img
          src={imgBookingIllustration.src}
          alt="Passenger Booking Illustration"
          className="w-full max-w-[800px] h-auto object-contain"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16 md:pb-32 flex-1 w-full relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Column: Form Details */}
          <div className="w-full lg:w-[60%] space-y-6 md:space-y-8">
            {/* Title Section */}
            <div className="mb-6 md:mb-10 text-center md:text-left">
              <h1 className="text-2xl md:text-[32px] font-bold text-black tracking-wide">
                <span className="border-b-4 border-black pb-1">PASSENGER</span> BOOKING
              </h1>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-800">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-800">Mail</label>
                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                />
              </div>

              {/* Contact and Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-800">Contact</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-800">Booking Date</label>
                  <input
                    type="text"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
              </div>
            </div>

            {/* Passenger Counter Section */}
            <div className="space-y-4 pt-4">
              {[
                { label: "Infant (0 - 2 yr old)", count: infantCount, setCount: setInfantCount, icon: Baby },
                { label: "Child (3 - 13 yr old)", count: childCount, setCount: setChildCount, icon: Users },
                { label: "Adult (13+ yr old)", count: adultCount, setCount: setAdultCount, icon: User }
              ].map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-white/50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <group.icon className="w-6 h-6 md:w-8 md:h-8 text-[#296341]" />
                    <span className="text-lg md:text-[20px] font-bold text-gray-800">{group.label}</span>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-full sm:w-[150px]">
                    <button onClick={() => group.setCount(Math.max(0, group.count - 1))} className="flex-1 py-2 md:py-3 flex items-center justify-center hover:bg-gray-50 text-gray-400">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-[50px] text-center text-xl md:text-[22px] font-black text-[#296341]">{group.count}</span>
                    <button onClick={() => group.setCount(group.count + 1)} className="flex-1 py-2 md:py-3 flex items-center justify-center hover:bg-gray-50 text-[#296341]">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* From / To Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-4">
              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" /> From
                </label>
                <div className="relative">
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px] font-bold"
                  >
                    <option value="NAS">NAS</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" /> To
                </label>
                <div className="relative">
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px] font-bold"
                  >
                    <option value="MAH">MAH</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
            </div>

            {/* ID Section */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-base md:text-[18px] font-bold text-gray-600">ID Type :</span>
                <div className="relative flex-1 max-w-[400px]">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] font-bold text-base md:text-[18px]"
                  >
                    <option value="DRIVER'S LICENCE">DRIVER'S LICENCE</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>

              {/* ID Gallery */}
              <div className="flex flex-col sm:flex-row gap-4 items-start py-4">
                <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
                  <Camera className="w-10 h-10 text-[#296341] cursor-pointer" />
                  <Paperclip className="w-10 h-10 text-[#296341] cursor-pointer" />
                </div>
                <div className="flex flex-col md:flex-row gap-4 flex-1 items-center w-full">
                  <div className="w-full md:w-[200px] aspect-[4/3] md:h-[260px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                    <img src={imgDriversLicense.src} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-rows-2 grid-cols-2 gap-4 h-auto md:h-[260px] w-full md:w-auto">
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square md:w-[140px]"><img src={imgDriversLicense.src} className="w-full h-full object-cover" /></div>
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square md:w-[140px]"><img src={imgDriversLicense.src} className="w-full h-full object-cover" /></div>
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square md:w-[140px]"><img src={imgDriversLicense.src} className="w-full h-full object-cover" /></div>
                    <div className="rounded-lg overflow-hidden relative aspect-square md:w-[140px] shadow-sm border border-gray-100 bg-gray-100">
                      <img src={imgDriversLicense.src} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[24px] font-bold font-['Inter']">+2</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button className="w-full sm:w-auto bg-[#296341]/80 hover:bg-[#296341] text-white px-10 py-4 rounded-lg font-bold text-lg md:text-[20px] transition-all shadow-md active:scale-95 flex items-center justify-center gap-3">
                  <Plus className="w-6 h-6" /> ADD LUGGAGE
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="w-full lg:w-[40%] mt-12 lg:mt-24">
            <div className="bg-[#c2dccf] rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-xl border-b-[10px] md:border-b-[12px] border-[#296341]/20 relative">

              {/* Contact Details in summary */}
              <div className="space-y-6 mb-12">
                <h3 className="text-xl md:text-[22px] font-bold text-[#244234] border-b border-[#244234]/10 pb-2">Contact Details</h3>
                <div className="space-y-4">
                  {[
                    { label: "Name", value: name, setter: setName },
                    { label: "Mail", value: mail, setter: setMail },
                    { label: "Contact", value: contact, setter: setContact }
                  ].map((field, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <label className="text-sm md:text-[16px] font-bold text-gray-500 sm:w-16">{field.label}</label>
                      <input
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="flex-1 h-10 md:h-[45px] bg-white rounded-lg px-4 shadow-sm outline-none font-bold text-sm md:text-base"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount Grid */}
              <div className="space-y-8 pb-32">
                <h3 className="text-center font-black text-lg md:text-[20px] tracking-widest text-[#244234]">TOTAL AMOUNT</h3>
                <div className="grid grid-cols-3 gap-3 md:gap-6 text-center">
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Passenger</p>
                    <p className="text-lg md:text-[22px] font-black">{infantCount + childCount + adultCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Invoice no.</p>
                    <p className="text-lg md:text-[22px] font-black">#1234567</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Invoice Date</p>
                    <p className="text-lg md:text-[22px] font-black">22/12/25</p>
                  </div>
                </div>

                {/* Location row */}
                <div className="space-y-4">
                  <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Location</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xl md:text-[24px] font-black flex items-center gap-3">NAS <ArrowRight className="text-[#296341]" /> MAH</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentStatus("PAID")}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${paymentStatus === 'PAID' ? 'bg-[#2ecc71] text-white' : 'bg-white text-gray-400'}`}
                      >
                        PAID
                      </button>
                      <button
                        onClick={() => setPaymentStatus("UNPAID")}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-full font-bold text-sm transition-all ${paymentStatus === 'UNPAID' ? 'bg-white text-gray-800 border border-gray-200' : 'bg-transparent text-gray-400'}`}
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
                  className="w-full h-24 md:h-[100px] bg-gray-100/50 rounded-2xl p-4 shadow-inner outline-none font-bold text-[#244234] resize-none text-sm md:text-base"
                />
              </div>

              {/* Overlapping Card */}
              <div className="static md:absolute md:left-[10%] md:right-[10%] md:-bottom-16 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl border border-gray-50 flex flex-col items-center mt-8 md:mt-0">
                <p className="text-base md:text-[18px] font-bold text-gray-400 tracking-wider">Total Amount</p>
                <p className="text-4xl md:text-[48px] font-black text-black leading-tight">$155.60</p>
                <p className="text-[10px] md:text-[12px] text-gray-400 font-bold uppercase tracking-tight">(Including 12% VAT)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 md:mt-32">
              <button className="w-full bg-[#132540] py-4 md:py-5 rounded-xl md:rounded-2xl text-white text-xl md:text-[24px] font-black tracking-widest hover:bg-[#1a3254] transition-all shadow-lg active:scale-95">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 md:py-10 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd." className="h-12 md:h-[80px]" />
          </div>
          <div className="text-white text-xl md:text-[32px] font-semibold text-center">
            Freight Agent | <span className="font-normal">Smith Frank</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PassengerBooking() {
  return <PassengerBookingContent />;
}
