"use client";

import { useState } from "react";
import { Camera, Paperclip, MapPin, ChevronDown, Check, ArrowRight } from "lucide-react";
import imgIllustration from "@/app/assets/fc4d24c0a5d260c8ee523edd7416ec133186b7d1.png";
import imgVehicle1 from "@/app/assets/02796ddb2f2036972ad517fb13092086bfeaac04.png";
import imgVehicle2 from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";
import imgIDCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Illustration */}
      <div className="flex justify-center mb-6 md:mb-8 px-4 sm:px-8">
        <img
          src={imgIllustration.src}
          alt="Vehicle Booking"
          className="w-full max-w-[800px] h-auto object-contain"
        />
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16 md:pb-32 flex-1 w-full relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Column: Form Details */}
          <div className="w-full lg:w-[65%] space-y-6 md:space-y-10">
            {/* Title Section */}
            <div className="mb-6 md:mb-10 text-center md:text-left">
              <h1 className="text-2xl md:text-[32px] font-bold text-black tracking-wide">
                <span className="border-b-4 border-black pb-1">VEHICLE</span> BOOKING
              </h1>
            </div>

            {/* Input Grid Sections */}
            <div className="space-y-6 md:space-y-8">
              {/* Make / Model Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">Make</label>
                  <input
                    type="text"
                    value={make || ""}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">Model</label>
                  <input
                    type="text"
                    value={model || ""}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
              </div>

              {/* License Plate / Booking Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">License Plate</label>
                  <input
                    type="text"
                    value={licensePlate || ""}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">Booking Date</label>
                  <input
                    type="text"
                    value={bookingDate || ""}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
              </div>

              {/* From / To Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/20" /> From
                  </label>
                  <div className="relative">
                    <select
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px]"
                    >
                      <option value="NAS">NAS</option>
                      <option value="MAH">MAH</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/20" /> To
                  </label>
                  <div className="relative">
                    <select
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px]"
                    >
                      <option value="NAS">NAS</option>
                      <option value="MAH">MAH</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Gallery */}
            <div className="flex flex-col sm:flex-row gap-4 items-start pt-4">
              <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-[#296341] cursor-pointer" />
                <Paperclip className="w-8 h-8 md:w-10 md:h-10 text-[#296341] cursor-pointer" />
              </div>

              <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                <div className="flex-[2] rounded-xl overflow-hidden shadow-md border border-gray-100 aspect-video md:aspect-auto">
                  <img src={imgVehicle1.src} alt="Main vehicle" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square"><img src={imgVehicle2.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square"><img src={imgVehicle1.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square"><img src={imgVehicle2.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden relative group cursor-pointer shadow-sm aspect-square">
                    <img src={imgVehicle1.src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg md:text-xl font-bold font-['Inter']">+2</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox for Non-Running */}
            <div className="flex items-start sm:items-center gap-3 py-2">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${nonRunning ? 'border-[#296341] bg-[#296341]' : 'border-gray-300'}`}
                onClick={() => setNonRunning(!nonRunning)}
              >
                {nonRunning && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-base md:text-[18px] font-medium leading-tight">
                Non-Running Vehicle <span className="text-gray-500 font-normal ml-0 sm:ml-2 block sm:inline">(Fees Added)</span>
              </span>
            </div>

            {/* Comments Box */}
            <div className="bg-[#f0f0f0] rounded-xl p-4 shadow-inner">
              <textarea
                value={comments || ""}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comments / Details..."
                className="w-full bg-transparent border-none outline-none text-base md:text-[18px] text-gray-700 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            {/* Contact Details Section */}
            <div className="space-y-6 pt-6">
              <h2 className="text-xl md:text-[22px] font-bold border-b border-gray-100 pb-2">Contact Details</h2>
              <div className="space-y-4 max-w-full sm:max-w-[500px]">
                {[
                  { label: "Name", value: contactName, setter: setContactName },
                  { label: "Mail", value: contactEmail, setter: setContactEmail },
                  { label: "Contact", value: contactPhone, setter: setContactPhone }
                ].map((field, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                    <label className="sm:w-20 font-bold text-gray-600 text-sm md:text-base">{field.label}</label>
                    <input
                      value={field.value || ""}
                      onChange={(e) => field.setter(e.target.value)}
                      className="flex-1 h-10 md:h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-sm md:text-base font-bold"
                    />
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <label className="sm:w-20 font-bold text-gray-600 text-sm md:text-base whitespace-nowrap">ID Type :</label>
                  <div className="relative flex-1">
                    <select
                      value={idType || ""}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full h-10 md:h-[45px] bg-white border border-gray-100 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] font-bold text-sm md:text-base"
                    >
                      <option value="DRIVER'S LICENCE">DRIVER&apos;S LICENCE</option>
                      <option value="PASSPORT">PASSPORT</option>
                      <option value="NATIONAL ID">NATIONAL ID</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* ID Gallery */}
            <div className="flex flex-col sm:flex-row gap-4 items-start pt-6">
              <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-[#296341] opacity-60" />
                <Paperclip className="w-8 h-8 md:w-10 md:h-10 text-[#296341] opacity-60" />
              </div>
              <div className="flex flex-col md:flex-row gap-4 flex-1 items-center w-full">
                <div className="w-full md:w-[200px] aspect-[4/3] md:h-[120px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                  <img src={imgIDCard.src} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-2 h-auto w-full md:w-auto">
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-video md:w-[80px] md:h-[50px]"><img src={imgIDCard.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-video md:w-[80px] md:h-[50px]"><img src={imgIDCard.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-video md:w-[80px] md:h-[50px]"><img src={imgIDCard.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 relative aspect-video md:w-[80px] md:h-[50px]">
                    <img src={imgIDCard.src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold font-['Inter']">+21</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Button */}
            <div className="flex justify-center pt-8">
              <button className="w-full sm:w-auto bg-[#296341]/80 hover:bg-[#296341] text-white px-10 py-4 rounded-lg font-bold text-lg md:text-[20px] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                + Add New Vehicle
              </button>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="w-full lg:w-[35%] mt-12 lg:mt-24">
            <div className="bg-[#c2dccf] rounded-[24px] md:rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-[#296341]/20 relative">
              {/* Deficiency Section */}
              <div className="space-y-6 mb-12">
                <h3 className="text-lg md:text-[20px] font-bold tracking-widest text-[#244234] border-b border-[#244234]/10 pb-2">DEFICIENCY</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs md:text-[14px] font-bold text-gray-600">Damage Found</label>
                    <div className="relative">
                      <select
                        value={deficiency || ""}
                        onChange={(e) => setDeficiency(e.target.value)}
                        className="w-full h-10 md:h-[40px] bg-white rounded-lg appearance-none px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-sm md:text-base font-bold"
                      >
                        <option value="Broken">Broken</option>
                        <option value="Dented">Dented</option>
                        <option value="Scratched">Scratched</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs md:text-[14px] font-bold text-gray-600">Damage Location</label>
                    <div className="relative">
                      <select
                        value={damageLocation || ""}
                        onChange={(e) => setDamageLocation(e.target.value)}
                        className="w-full h-10 md:h-[40px] bg-white rounded-lg appearance-none px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-sm md:text-base font-bold"
                      >
                        <option value="Upper Back">Upper Back</option>
                        <option value="Front">Front</option>
                        <option value="Side">Side</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs md:text-[14px] font-bold text-gray-600">Comment Details</label>
                    <input
                      value={commentDetails || ""}
                      onChange={(e) => setCommentDetails(e.target.value)}
                      className="w-full h-10 md:h-[45px] bg-white rounded-lg px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-sm md:text-base font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount Grid */}
              <div className="space-y-8 pb-32">
                <h3 className="text-center font-bold text-base md:text-[18px] tracking-widest">TOTAL AMOUNT</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {[
                    { label: "Quantity", value: quantity },
                    { label: "Licence plate", value: licensePlate },
                    { label: "Location", value: `${fromLocation} -> ${toLocation}`, isLocation: true },
                    { label: "Invoice no.", value: invoiceNo },
                    { label: "Voyage", value: voyage, isHighlight: true },
                    { label: "Invoice Date", value: invoiceDate }
                  ].map((item, idx) => (
                    <div key={idx} className={item.isHighlight ? "col-span-2 sm:col-span-1" : ""}>
                      <p className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase">{item.label}</p>
                      <p className={`text-base md:text-[20px] font-bold ${item.isHighlight ? 'text-[#132540]' : ''}`}>
                        {item.isLocation ? (
                          <span className="flex items-center gap-1">{fromLocation} <ArrowRight className="w-3 h-3" /> {toLocation}</span>
                        ) : item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Paid / Unpaid Toggle UI */}
                <div className="flex gap-2 bg-gray-200/50 p-1 rounded-full border border-white/40">
                  <button
                    onClick={() => setPaymentStatus("PAID")}
                    className={`flex-1 py-2 rounded-full font-bold text-sm flex items-center justify-center gap-1 shadow-sm transition-all ${paymentStatus === 'PAID' ? 'bg-[#2ecc71] text-white' : 'text-gray-400'}`}
                  >
                    PAID
                  </button>
                  <button
                    onClick={() => setPaymentStatus("UNPAID")}
                    className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${paymentStatus === 'UNPAID' ? 'bg-white text-gray-800' : 'text-gray-400'}`}
                  >
                    UNPAID
                  </button>
                </div>

                <input
                  placeholder="Remark"
                  value={remark || ""}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full h-10 md:h-[40px] bg-gray-100/50 rounded-lg px-4 shadow-inner outline-none text-xs md:text-sm font-['Inter'] font-bold"
                />
              </div>

              {/* Overlapping Total Card */}
              <div className="static md:absolute md:left-[10%] md:right-[10%] md:-bottom-12 bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-50 flex flex-col items-center mt-8 md:mt-0">
                <p className="text-sm md:text-[14px] font-bold text-gray-400">Total Amount</p>
                <p className="text-4xl md:text-[36px] font-black text-black leading-tight">$375.60</p>
                <p className="text-[10px] text-gray-400 font-semibold tracking-tighter uppercase">(Including 12% VAT)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 md:mt-24">
              <button className="w-full bg-[#132540] py-4 md:py-5 rounded-xl md:rounded-2xl text-white text-lg md:text-[24px] font-black tracking-widest hover:bg-[#1a3254] transition-all shadow-lg active:scale-95">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 md:py-10 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd." className="h-12 md:h-[70px]" />
          </div>
          <div className="text-white text-xl md:text-[28px] font-semibold text-center">
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
