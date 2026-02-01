import { useState } from "react";
import { Camera, Paperclip, MapPin } from "lucide-react";
import svgPaths from "../imports/svg-ovt86v4kbr";
import imgIllustration from "figma:asset/fc4d24c0a5d260c8ee523edd7416ec133186b7d1.png";
import imgVehicle1 from "figma:asset/02796ddb2f2036972ad517fb13092086bfeaac04.png";
import imgVehicle2 from "figma:asset/cf53a64ce492864216e5a9b357abee066ed01103.png";
import imgIDCard from "figma:asset/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "figma:asset/0630bc807bbd9122cb449e66c33d18d13536d121.png";

export default function VehicleBooking() {
  const [menuOpen, setMenuOpen] = useState(false);
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
  const [invoiceDate, setInvoiceDate] = useState("20 /12 / 25");
  const [voyage, setVoyage] = useState("Voyage 209");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [remark, setRemark] = useState("");

  const vehicleImages = [imgVehicle1, imgVehicle2, imgVehicle1, imgVehicle2];
  const idImages = [imgIDCard, imgIDCard, imgIDCard, imgIDCard];

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Hamburger Menu */}
      <header className="relative h-[220px]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute left-[50px] top-[35px] w-[50px] h-[50px] flex flex-col gap-2 items-center justify-center hover:opacity-80 transition-opacity"
        >
          <div className="w-[40px] h-[4px] bg-[#296341]"></div>
          <div className="w-[40px] h-[4px] bg-[#296341]"></div>
          <div className="w-[40px] h-[4px] bg-[#296341]"></div>
        </button>

        {/* Illustration */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20px] w-[300px] h-[200px]">
          <img
            src={imgIllustration}
            alt="Shipping illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-8 pb-12">
        <div className="grid grid-cols-[1fr_380px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="font-['Inter'] font-medium text-[30px] text-black mb-2">
                VEHICLE BOOKING
              </h1>
              <div className="w-[160px] h-[3px] bg-black"></div>
            </div>

            {/* Make and Model Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-['Inter'] font-normal text-[16px] text-black mb-2">
                  Make
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
              <div>
                <label className="block font-['Inter'] font-normal text-[16px] text-black mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
            </div>

            {/* License Plate and Booking Date Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-['Inter'] font-normal text-[16px] text-black mb-2">
                  License Plate
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
              <div>
                <label className="block font-['Inter'] font-normal text-[16px] text-black mb-2">
                  Booking Date
                </label>
                <input
                  type="text"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
            </div>

            {/* From and To Location Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 font-['Inter'] font-normal text-[16px] text-black mb-2">
                  <svg className="w-[30px] h-[30px]" fill="none" viewBox="0 0 30 30">
                    <path d={svgPaths.p33fa4080} fill="#296341" />
                  </svg>
                  From
                </label>
                <div className="relative">
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full h-[40px] px-3 pr-10 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  >
                    <option value="NAS">NAS</option>
                    <option value="MAH">MAH</option>
                    <option value="GTC">GTC</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-[20px] h-[40px]" fill="none" viewBox="0 0 20 40">
                      <path d={svgPaths.p28436f80} fill="#296341" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 font-['Inter'] font-normal text-[16px] text-black mb-2">
                  <svg className="w-[36px] h-[36px]" fill="none" viewBox="0 0 36 36">
                    <path d={svgPaths.p4420500} fill="#296341" />
                  </svg>
                  To
                </label>
                <div className="relative">
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full h-[40px] px-3 pr-10 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  >
                    <option value="NAS">NAS</option>
                    <option value="MAH">MAH</option>
                    <option value="GTC">GTC</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-[20px] h-[40px]" fill="none" viewBox="0 0 20 40">
                      <path d={svgPaths.p28436f80} fill="#296341" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Images */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <svg className="w-[50px] h-[50px]" fill="none" viewBox="0 0 50 50">
                  <path clipRule="evenodd" d={svgPaths.p3e4b7f00} fill="#296341" fillRule="evenodd" />
                </svg>
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {vehicleImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden border border-gray-300">
                      <img src={img} alt={`Vehicle ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <span className="font-['Inter'] font-bold text-white text-[24px]">+2</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-[50px] h-[50px]" fill="none" viewBox="0 0 50 50">
                  <path d={svgPaths.p2b4a59a0} stroke="#296341" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                </svg>
              </div>
            </div>

            {/* Non-Running Vehicle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-400 flex items-center justify-center">
                  <input
                    type="radio"
                    checked={nonRunning}
                    onChange={() => setNonRunning(!nonRunning)}
                    className="sr-only"
                  />
                  {nonRunning && <div className="w-[12px] h-[12px] rounded-full bg-[#296341]"></div>}
                </div>
                <span className="font-['Inter'] font-normal text-[16px] text-black">
                  Non-Running Vehicle
                </span>
              </label>
              <span className="font-['Inter'] font-normal text-[14px] text-gray-600">
                (Fees Added)
              </span>
            </div>

            {/* Comments */}
            <div>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comments / Details..."
                rows={3}
                className="w-full px-3 py-2 bg-[#f0f0f0] border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#296341] resize-none"
              />
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="font-['Inter'] font-semibold text-[18px] text-black mb-4">
                Contact Details
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                  <label className="font-['Inter'] font-normal text-[16px] text-black">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                  <label className="font-['Inter'] font-normal text-[16px] text-black">
                    Mail
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                  <label className="font-['Inter'] font-normal text-[16px] text-black">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="h-[40px] px-3 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
              </div>
            </div>

            {/* ID Type */}
            <div>
              <div className="grid grid-cols-[80px_1fr] gap-4 items-center mb-3">
                <label className="font-['Inter'] font-normal text-[16px] text-black">
                  ID Type :
                </label>
                <div className="relative">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full h-[40px] px-3 pr-10 border border-gray-300 rounded font-['Inter'] font-normal text-[16px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  >
                    <option value="DRIVER'S LICENCE">DRIVER'S LICENCE</option>
                    <option value="PASSPORT">PASSPORT</option>
                    <option value="NATIONAL ID">NATIONAL ID</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-[20px] h-[40px]" fill="none" viewBox="0 0 20 40">
                      <path d={svgPaths.p28436f80} fill="#296341" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ID Images */}
              <div className="flex items-center gap-4">
                <svg className="w-[50px] h-[50px]" fill="none" viewBox="0 0 50 50">
                  <path clipRule="evenodd" d={svgPaths.p3e4b7f00} fill="#296341" fillRule="evenodd" />
                </svg>
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {idImages.map((img, i) => (
                    <div key={i} className="relative aspect-[3/2] rounded overflow-hidden border border-gray-300">
                      <img src={img} alt={`ID ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                          <span className="font-['Inter'] font-bold text-white text-[20px]">+21</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <svg className="w-[50px] h-[50px]" fill="none" viewBox="0 0 50 50">
                  <path d={svgPaths.p2b4a59a0} stroke="#296341" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
                </svg>
              </div>
            </div>

            {/* Add New Vehicle Button */}
            <div className="flex justify-center pt-4">
              <button className="bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-normal text-[16px] px-6 py-2 rounded">
                + Add New Vehicle
              </button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="bg-[#c2d9d1] rounded-lg px-6 py-6 h-fit">
            {/* Deficiency */}
            <div className="mb-6">
              <h3 className="font-['Inter'] font-semibold text-[18px] text-black mb-3">
                DEFICIENCY
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-['Inter'] font-normal text-[14px] text-black mb-2">
                    Damage Found
                  </label>
                  <div className="relative">
                    <select
                      value={deficiency}
                      onChange={(e) => setDeficiency(e.target.value)}
                      className="w-full h-[36px] px-3 pr-10 bg-white border border-gray-300 rounded font-['Inter'] font-normal text-[14px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="Broken">Broken</option>
                      <option value="Dented">Dented</option>
                      <option value="Scratched">Scratched</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-[16px] h-[32px]" fill="none" viewBox="0 0 20 40">
                        <path d={svgPaths.p28436f80} fill="#296341" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-['Inter'] font-normal text-[14px] text-black mb-2">
                    Damage Location
                  </label>
                  <div className="relative">
                    <select
                      value={damageLocation}
                      onChange={(e) => setDamageLocation(e.target.value)}
                      className="w-full h-[36px] px-3 pr-10 bg-white border border-gray-300 rounded font-['Inter'] font-normal text-[14px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="Upper Back">Upper Back</option>
                      <option value="Front">Front</option>
                      <option value="Side">Side</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-[16px] h-[32px]" fill="none" viewBox="0 0 20 40">
                        <path d={svgPaths.p28436f80} fill="#296341" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-['Inter'] font-normal text-[14px] text-black mb-2">
                    Comment Details
                  </label>
                  <input
                    type="text"
                    value={commentDetails}
                    onChange={(e) => setCommentDetails(e.target.value)}
                    className="w-full h-[36px] px-3 bg-white border border-gray-300 rounded font-['Inter'] font-normal text-[14px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
              </div>
            </div>

            {/* Total Amount Section */}
            <div className="mb-6">
              <h3 className="font-['Inter'] font-semibold text-[18px] text-black mb-4 text-center">
                TOTAL AMOUNT
              </h3>
              <div className="grid grid-cols-2 gap-y-3 mb-4">
                <div>
                  <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                    Quantity
                  </div>
                  <div className="font-['Inter'] font-semibold text-[16px] text-black">
                    {quantity}
                  </div>
                </div>
                <div>
                  <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                    Licence plate
                  </div>
                  <div className="font-['Inter'] font-semibold text-[16px] text-black">
                    {licensePlate}
                  </div>
                </div>
                <div>
                  <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                    Location
                  </div>
                  <div className="font-['Inter'] font-semibold text-[16px] text-black">
                    {fromLocation} → {toLocation}
                  </div>
                </div>
                <div>
                  <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                    Invoice no.
                  </div>
                  <div className="font-['Inter'] font-semibold text-[16px] text-black">
                    {invoiceNo}
                  </div>
                </div>
                <div>
                  <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                    {voyage}
                  </div>
                </div>
                <div>
                  <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                    Invoice Date
                  </div>
                  <div className="font-['Inter'] font-semibold text-[16px] text-black">
                    {invoiceDate}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPaymentStatus("PAID")}
                  className={`flex-1 h-[32px] rounded-full font-['Inter'] font-normal text-[14px] transition-colors ${
                    paymentStatus === "PAID"
                      ? "bg-[#00a651] text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  PAID
                </button>
                <button
                  onClick={() => setPaymentStatus("UNPAID")}
                  className={`flex-1 h-[32px] rounded-full font-['Inter'] font-normal text-[14px] transition-colors ${
                    paymentStatus === "UNPAID"
                      ? "bg-gray-400 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  UNPAID
                </button>
              </div>

              {/* Remark */}
              <div className="mb-4">
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Remark"
                  className="w-full h-[36px] px-3 bg-[#e8e8e8] border border-gray-300 rounded font-['Inter'] font-normal text-[14px] text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>

              {/* Total Amount Display */}
              <div className="bg-white border-2 border-black rounded-lg px-4 py-3 text-center mb-6">
                <div className="font-['Inter'] font-normal text-[14px] text-black mb-1">
                  Total Amount
                </div>
                <div className="font-['Inter'] font-bold text-[28px] text-black">
                  $375.60
                </div>
                <div className="font-['Inter'] font-normal text-[12px] text-gray-600">
                  (excluding 25% VAT)
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full h-[48px] bg-[#132540] hover:bg-[#0d1a2d] transition-colors text-white font-['Inter'] font-semibold text-[18px] rounded">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#296341] h-[100px] flex items-center justify-between px-12">
        <div className="w-[200px] h-[60px]">
          <img
            src={imgLogo}
            alt="Dean's Shipping Ltd."
            className="w-full h-full object-contain"
          />
        </div>
        <div className="font-['Inter'] text-[24px] text-white">
          <span className="font-semibold">Freight Agent</span>
          <span className="mx-3">|</span>
          <span className="font-normal">Smith Frank</span>
        </div>
      </footer>
    </div>
  );
}
