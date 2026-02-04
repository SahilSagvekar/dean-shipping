"use client";

import { useState } from "react";
import { Camera, Paperclip, MapPin, ChevronDown, Check, ArrowRight } from "lucide-react";
import imgIllustration from "@/app/assets/fc4d24c0a5d260c8ee523edd7416ec133186b7d1.png";
import imgVehicle1 from "@/app/assets/02796ddb2f2036972ad517fb13092086bfeaac04.png";
import imgVehicle2 from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";
import imgIDCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// Sidebar is now handled by (dashboard)/layout.tsx

function VehicleBookingContent() {
  const [make, setMake] = useState("Hundai");
  const [model, setModel] = useState("Creta");
  const [licensePlate, setLicensePlate] = useState("BD 2394");
  const [bookingDate, setBookingDate] = useState("12 / 12 / 2025");
  const [fromLocation, setFromLocation] = useState("NAS");
  const [toLocation, setToLocation] = useState("MAH");
  const [deficiency, setDeficiency] = useState("Broken");
  const [damageLocation, setDamageLocation] = useState("Upper Back");
  const [commentDetails, setCommentDetails] = useState("left back Headlight broken");
  const [nonRunning, setNonRunning] = useState(false);
  const [comments, setComments] = useState("");
  const [contactName, setContactName] = useState("Jane Robin Forbes");
  const [contactEmail, setContactEmail] = useState("janeforbes@demo.com");
  const [contactPhone, setContactPhone] = useState("+1 1234 1234");
  const [idType, setIdType] = useState("DRIVER'S LICENCE");
  const [quantity, setQuantity] = useState("1");
  const [invoiceNo, setInvoiceNo] = useState("#56724");
  const [invoiceDate, setInvoiceDate] = useState("20 / 12 / 25");
  const [voyage, setVoyage] = useState("Voyage 209");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [remark, setRemark] = useState("");

  const vehicleImages = [imgVehicle1, imgVehicle2, imgVehicle1, imgVehicle2];
  const idImages = [imgIDCard, imgIDCard, imgIDCard, imgIDCard];

  return (
    <div>

      {/* Sidebar and Hamburger are now handled by the dashboard layout */}


      {/* Illustration */}
      <div className="flex justify-center mb-8 px-8">
        <img
          src={imgIllustration.src}
          alt="Vehicle Booking"
          className="w-full max-w-[800px] h-auto"
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-8 pb-16 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left Column: Form Details */}
          <div className="lg:w-[65%] space-y-10">
            {/* Title with partial underline */}
            <div className="mb-10">
              <h1 className="text-[32px] font-bold text-black tracking-wide">
                <span className="border-b-4 border-black pb-1">VEHICLE</span> BOOKING
              </h1>
            </div>

            {/* Make / Model Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-700">Make</label>
                <input
                  type="text"
                  value={make || ""}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-700">Model</label>
                <input
                  type="text"
                  value={model || ""}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
                />
              </div>
            </div>

            {/* License Plate / Booking Date Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-700">License Plate</label>
                <input
                  type="text"
                  value={licensePlate || ""}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-700">Booking Date</label>
                <input
                  type="text"
                  value={bookingDate || ""}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-[18px]"
                />
              </div>
            </div>

            {/* From / To Dropdowns */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/20" /> From
                </label>
                <div className="relative">
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
                  >
                    <option value="NAS">NAS</option>
                    <option value="MAH">MAH</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[18px] font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/20" /> To
                </label>
                <div className="relative">
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px]"
                  >
                    <option value="NAS">NAS</option>
                    <option value="MAH">MAH</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
            </div>

            {/* Large Image Gallery UI */}
            <div className="flex gap-4 items-start">
              <div className="flex flex-col gap-4 mt-2">
                <Camera className="w-8 h-8 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
                <Paperclip className="w-8 h-8 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
              </div>

              <div className="flex gap-4 flex-1">
                <div className="flex-[2] rounded-xl overflow-hidden shadow-md border border-gray-100">
                  <img src={imgVehicle1.src} alt="Main vehicle" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm"><img src={imgVehicle2.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm"><img src={imgVehicle1.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm"><img src={imgVehicle2.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden relative group cursor-pointer shadow-sm">
                    <img src={imgVehicle1.src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[20px] font-bold">+2</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox for Non-Running */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${nonRunning ? 'border-[#296341] bg-[#296341]' : 'border-gray-300'}`}
                onClick={() => setNonRunning(!nonRunning)}
              >
                {nonRunning && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-[18px] font-medium">Non-Running Vehicle <span className="text-gray-500 font-normal ml-2">(Fees Added)</span></span>
            </div>

            {/* Comments Box */}
            <div className="bg-[#f0f0f0] rounded-xl p-4 shadow-inner">
              <textarea
                value={comments || ""}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comments / Details..."
                className="w-full bg-transparent border-none outline-none text-[18px] text-gray-700 min-h-[80px] resize-none"
              />
            </div>

            {/* Contact Details Section */}
            <div className="space-y-6 pt-6">
              <h2 className="text-[22px] font-bold border-b border-gray-100 pb-2">Contact Details</h2>
              <div className="space-y-4 max-w-[500px]">
                <div className="flex items-center gap-8">
                  <label className="w-20 font-bold text-gray-600">Name</label>
                  <input
                    value={contactName || ""}
                    onChange={(e) => setContactName(e.target.value)}
                    className="flex-1 h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="flex items-center gap-8">
                  <label className="w-20 font-bold text-gray-600">Mail</label>
                  <input
                    value={contactEmail || ""}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="flex-1 h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="flex items-center gap-8">
                  <label className="w-20 font-bold text-gray-600">Contact</label>
                  <input
                    value={contactPhone || ""}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="flex-1 h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="flex items-center gap-8">
                  <label className="w-20 font-bold text-gray-600 whitespace-nowrap">ID Type :</label>
                  <div className="relative flex-1">
                    <select
                      value={idType || ""}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full h-[45px] bg-white border border-gray-100 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="DRIVER'S LICENCE">DRIVER&apos;S LICENCE</option>
                      <option value="PASSPORT">PASSPORT</option>
                      <option value="NATIONAL ID">NATIONAL ID</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                  </div>
                </div>
              </div>
            </div>

            {/* ID Images Gallery */}
            <div className="flex gap-4 items-start">
              <div className="flex flex-col gap-4 mt-2">
                <Camera className="w-8 h-8 text-[#296341] opacity-60" />
                <Paperclip className="w-8 h-8 text-[#296341] opacity-60" />
              </div>
              <div className="flex gap-4 flex-1 items-center">
                <div className="w-[200px] h-[120px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                  <img src={imgIDCard.src} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-[80px] h-[50px] rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgIDCard.src} className="w-full h-full object-cover" /></div>
                  <div className="w-[80px] h-[50px] rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgIDCard.src} className="w-full h-full object-cover" /></div>
                  <div className="w-[80px] h-[50px] rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgIDCard.src} className="w-full h-full object-cover" /></div>
                  <div className="w-[80px] h-[50px] rounded-lg overflow-hidden shadow-sm border border-gray-100 relative">
                    <img src={imgIDCard.src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold font-['Inter']">+21</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Button */}
            <div className="flex justify-center pt-4">
              <button className="bg-[#296341]/80 hover:bg-[#296341] text-white px-8 py-3 rounded-lg font-bold text-[18px] transition-all shadow-md active:scale-95 flex items-center gap-2">
                + Add New Vehicle
              </button>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="lg:w-[35%]">
            <div className="bg-[#c2dccf] rounded-3xl p-8 shadow-xl border-b-8 border-[#296341]/20 relative">
              {/* Deficiency Section */}
              <div className="space-y-6 mb-12">
                <h3 className="text-[20px] font-bold tracking-widest text-[#244234] border-b border-[#244234]/10 pb-2">DEFICIENCY</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-gray-600">Damage Found</label>
                    <div className="relative">
                      <select
                        value={deficiency || ""}
                        onChange={(e) => setDeficiency(e.target.value)}
                        className="w-full h-[40px] bg-white rounded-lg appearance-none px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="Broken">Broken</option>
                        <option value="Dented">Dented</option>
                        <option value="Scratched">Scratched</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-gray-600">Damage Location</label>
                    <div className="relative">
                      <select
                        value={damageLocation || ""}
                        onChange={(e) => setDamageLocation(e.target.value)}
                        className="w-full h-[40px] bg-white rounded-lg appearance-none px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="Upper Back">Upper Back</option>
                        <option value="Front">Front</option>
                        <option value="Side">Side</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-gray-600">Comment Details</label>
                    <input
                      value={commentDetails || ""}
                      onChange={(e) => setCommentDetails(e.target.value)}
                      className="w-full h-[45px] bg-white rounded-lg px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount Grid */}
              <div className="space-y-8 pb-32">
                <h3 className="text-center font-bold text-[18px] tracking-widest">TOTAL AMOUNT</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[12px] font-bold text-gray-500 uppercase">Quantity</p>
                    <p className="text-[20px] font-bold">{quantity}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-500 uppercase">Licence plate</p>
                    <p className="text-[20px] font-bold">{licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-500 uppercase">Location</p>
                    <p className="text-[18px] font-bold flex items-center gap-1">{fromLocation} <ArrowRight className="w-3 h-3" /> {toLocation}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-500 uppercase">Invoice no.</p>
                    <p className="text-[20px] font-bold">{invoiceNo}</p>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-[#132540]">{voyage}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-500 uppercase">Invoice Date</p>
                    <p className="text-[20px] font-bold">{invoiceDate}</p>
                  </div>
                </div>

                {/* Paid / Unpaid Toggle UI */}
                <div className="flex gap-2 bg-gray-200/50 p-1 rounded-full border border-white/40">
                  <button className="flex-1 py-1 bg-[#2ecc71] text-white rounded-full font-bold text-sm flex items-center justify-center gap-1 shadow-sm">
                    PAID
                  </button>
                  <button className="flex-1 py-1 text-gray-400 font-bold text-sm">
                    UNPAID
                  </button>
                </div>

                <input
                  placeholder="Remark"
                  value={remark || ""}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full h-[40px] bg-gray-100/50 rounded-lg px-4 shadow-inner outline-none text-sm font-['Inter']"
                />
              </div>

              {/* Overlapping Total Card */}
              <div className="absolute left-[10%] right-[10%] -bottom-12 bg-white rounded-2xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border-2 border-gray-50 flex flex-col items-center">
                <p className="text-[14px] font-bold text-gray-400">Total Amount</p>
                <p className="text-[36px] font-black text-black leading-tight">$375.60</p>
                <p className="text-[10px] text-gray-400 font-semibold tracking-tighter uppercase">(Including 12% VAT)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-20">
              <button className="w-full bg-[#132540] py-4 rounded-xl text-white text-[20px] font-bold tracking-widest hover:bg-[#1a3254] transition-all shadow-lg active:scale-95">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[70px]" />
          </div>
          <div className="text-white text-[28px] font-semibold">
            Freight Agent | <span className="font-normal">Smith Frank</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function VehicleBooking() {
  return <VehicleBookingContent />;
}
