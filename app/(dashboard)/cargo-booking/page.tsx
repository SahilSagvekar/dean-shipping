"use client";

import { useState } from 'react';
import {
  Camera,
  Paperclip,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  MapPin,
  Calendar,
  Package,
  Box,
  Container,
  ArrowRight
} from 'lucide-react';
import imgCargoShip from "@/app/assets/3f7d36fbe26222b564747f69753922efbd74194d.png";
import imgContainer from "@/app/assets/5edceaf79f7be705450710aa82c190c67fbcaf62.png";
import imgPassport from "@/app/assets/bbad37ee24906289e97d640c601d7cafe55963b5.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// Sidebar is now handled by (dashboard)/layout.tsx

const cargoItemsList = [
  { id: 1, icon: 'box', type: 'DRY BOX(S) x 3', amount: '$50 (3)', total: '$150', paid: true },
  { id: 2, icon: 'container', type: 'Container (40ft) x 1', amount: '$500 (1)', total: '$500', paid: false },
];

function CargoBookingContent() {
  const [service, setService] = useState('CONTAINER');
  const [cargoType, setCargoType] = useState('Medium');
  const [quantity, setQuantity] = useState("");
  const [pallets, setPallets] = useState("");
  const [type, setType] = useState("DRY");
  const [containerNo, setContainerNo] = useState("134");
  const [size, setSize] = useState("");
  const [height, setHeight] = useState("");
  const [reefer, setReefer] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [chassisNo, setChassisNo] = useState("2");
  const [temperature, setTemperature] = useState("50°C");
  const [decksNo, setDecksNo] = useState("");

  const [bookingDate, setBookingDate] = useState("20 / 12 / 2025");
  const [fromLocation, setFromLocation] = useState("NAS");
  const [toLocation, setToLocation] = useState("MAH");

  const [contactName, setContactName] = useState("Jane Robin Forbes");
  const [contactEmail, setContactEmail] = useState("janeforbes101@sample.com");
  const [contactPhone, setContactPhone] = useState("+1 1234 1234");
  const [address, setAddress] = useState("ABC-12, ABC DEF, BD-12");
  const [idType, setIdType] = useState("Passport");

  const [deficiency, setDeficiency] = useState("Broken");
  const [damageLocation, setDamageLocation] = useState("Left Center");
  const [comment, setComment] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [remark, setRemark] = useState("");

  const cargoRadioTypes = ['Small', 'Medium', 'Large', 'Fragile', 'Hazardous', 'Live'];

  return (
    <div>

      {/* Sidebar and Hamburger are now handled by the dashboard layout */}


      {/* Hero Illustration */}
      <div className="flex justify-center mb-6 px-8">
        <img
          src={imgCargoShip.src}
          alt="Cargo Booking Illustration"
          className="w-full max-w-[800px] h-auto object-contain"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-16 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-10">
          <h1 className="text-[32px] font-bold text-black tracking-wide">
            <span className="border-b-4 border-black pb-1">CARGO</span> BOOKING
          </h1>
        </div>

        {/* Form Section */}
        <div className="space-y-10 max-w-[1100px]">
          {/* Service Dropdown */}
          <div className="flex items-center gap-6">
            <label className="text-[20px] font-bold text-gray-800 min-w-[80px]">Service</label>
            <div className="relative w-full max-w-[500px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#296341]">
                <Container className="w-5 h-5" />
              </div>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full h-[54px] bg-[#eef6f2] border border-[#d1e5da] rounded-md pl-14 pr-10 text-[18px] font-bold text-[#244234] appearance-none outline-none focus:ring-2 focus:ring-[#296341]"
              >
                <option value="CONTAINER">CONTAINER</option>
                <option value="PALLET">PALLET</option>
                <option value="BOX">BOX</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
            </div>
          </div>

          {/* Radio Grid (2x3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12 max-w-[900px]">
            {cargoRadioTypes.map((type) => (
              <label key={type} className="flex items-center gap-4 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cargoType === type ? 'border-[#296341]' : 'border-gray-300'
                    }`}
                  onClick={() => setCargoType(type)}
                >
                  {cargoType === type && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
                </div>
                <span className="text-[18px] font-medium text-gray-700 group-hover:text-black">{type}</span>
              </label>
            ))}
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Detailed Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Row 1 */}
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Quantity</label>
              <input value={quantity || ""} onChange={(e) => setQuantity(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Pallets#</label>
              <input value={pallets || ""} onChange={(e) => setPallets(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Type</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold">
                  <option value="DRY">DRY</option>
                  <option value="FROZEN">FROZEN</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Container#</label>
              <div className="relative">
                <select value={containerNo} onChange={(e) => setContainerNo(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold">
                  <option value="134">134</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Size</label>
              <div className="relative">
                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Height</label>
              <div className="relative">
                <select value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Reefer#</label>
              <input value={reefer || ""} onChange={(e) => setReefer(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Material</label>
              <input value={material || ""} onChange={(e) => setMaterial(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Color</label>
              <div className="relative">
                <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] py-2 appearance-none font-bold">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Row 4 */}
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Chassis#</label>
              <input value={chassisNo || ""} onChange={(e) => setChassisNo(e.target.value)} className="w-full h-[45px] border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Temperature</label>
              <input value={temperature || ""} onChange={(e) => setTemperature(e.target.value)} className="w-full h-[45px] border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[16px] font-bold text-gray-500">Decks#</label>
              <input value={decksNo || ""} onChange={(e) => setDecksNo(e.target.value)} className="w-full h-[45px] border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]" />
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full" />

          {/* Date / Location row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700">Date</label>
              <div className="relative">
                <input value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-[18px]" />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" /> From
              </label>
              <div className="relative">
                <select value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold">
                  <option value="NAS">NAS</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[18px] font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/10" /> To
              </label>
              <div className="relative">
                <select value={toLocation} onChange={(e) => setToLocation(e.target.value)} className="w-full h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-[18px] font-bold">
                  <option value="MAH">MAH</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
              </div>
            </div>
          </div>

          {/* Image Gallery UI */}
          <div className="flex gap-4 items-start pt-6">
            <div className="flex flex-col gap-4 mt-2">
              <Camera className="w-10 h-10 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
              <Paperclip className="w-10 h-10 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
            </div>

            <div className="flex gap-4 flex-1">
              <div className="flex-[2] rounded-xl overflow-hidden shadow-md border-2 border-[#296341]/20">
                <img src={imgContainer.src} alt="Container main" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm"><img src={imgContainer.src} className="w-full h-full object-cover" /></div>
                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm"><img src={imgContainer.src} className="w-full h-full object-cover" /></div>
                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm"><img src={imgContainer.src} className="w-full h-full object-cover" /></div>
                <div className="rounded-lg overflow-hidden relative group cursor-pointer shadow-sm">
                  <img src={imgContainer.src} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[20px] font-bold font-['Inter']">+2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Box Contains row */}
          <div className="flex items-center gap-6 pt-4 border-b border-gray-100 pb-4">
            <span className="text-[18px] font-bold text-gray-500 whitespace-nowrap">Box Contains</span>
            <span className="text-[18px] font-medium text-[#244234]">clothing, shoes, non-perishables</span>
          </div>

          {/* Deficiency Section */}
          <div className="space-y-6 pt-6">
            <h2 className="text-[26px] font-bold text-[#296341]">DEFICIENCY</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-500">Damage Found</label>
                <div className="relative">
                  <select value={deficiency} onChange={(e) => setDeficiency(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] font-bold appearance-none bg-transparent">
                    <option value="Broken">Broken</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-500">Damage Location</label>
                <div className="relative">
                  <select value={damageLocation} onChange={(e) => setDamageLocation(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] font-bold appearance-none bg-transparent">
                    <option value="Left Center">Left Center</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-500">Comment</label>
                <input value={comment || ""} onChange={(e) => setComment(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px]" />
              </div>
            </div>
          </div>

          {/* Add Item / Submit buttons */}
          <div className="flex gap-6 py-6">
            <button className="bg-[#132540] text-white px-12 py-3 rounded-lg text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 flex items-center gap-3">
              <Plus className="w-6 h-6" /> ADD ITEM
            </button>
            <button className="bg-[#132540] text-white px-16 py-3 rounded-lg text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95">
              SUBMIT
            </button>
          </div>

          <div className="h-0.5 bg-gray-200 w-full" />

          {/* User Details */}
          <div className="space-y-8">
            <h2 className="text-[26px] font-bold text-[#296341]">USER DETAILS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Full Name</label>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full h-[45px] text-[18px] font-bold uppercase outline-none" />
              </div>
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-[45px] text-[18px] font-bold outline-none" />
                <ChevronDown className="float-right -mt-8 text-gray-400 w-4 h-4" />
              </div>
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Email Address</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]" />
              </div>
              <div className="space-y-2 border-l-4 border-gray-100 pl-4">
                <label className="text-[14px] font-bold text-gray-500">Contact Number</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341]" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-bold text-gray-600">ID Type :</span>
                <div className="relative flex-1">
                  <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full h-[45px] bg-white border border-gray-100 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] font-bold">
                    <option value="Passport">Passport</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>
            </div>

            {/* User ID Gallery */}
            <div className="flex gap-4 items-start pt-6">
              <div className="flex flex-col gap-4 mt-2">
                <Camera className="w-10 h-10 text-[#296341] cursor-pointer" />
                <Paperclip className="w-10 h-10 text-[#296341] cursor-pointer" />
              </div>
              <div className="flex gap-4 flex-1 items-center">
                <div className="w-[200px] h-[260px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                  <img src={imgPassport.src} className="w-full h-full object-cover" />
                </div>
                <div className="w-[200px] h-[260px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                  <img src={imgPassport.src} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-rows-2 grid-cols-2 gap-4 h-[260px]">
                  <div className="w-[140px] rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgIdCard.src} className="w-full h-full object-cover" /></div>
                  <div className="w-[140px] rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgPassport.src} className="w-full h-full object-cover" /></div>
                  <div className="w-[140px] rounded-lg overflow-hidden shadow-sm border border-gray-100"><img src={imgIdCard.src} className="w-full h-full object-cover" /></div>
                  <div className="w-[140px] rounded-lg overflow-hidden shadow-sm border border-gray-100 relative">
                    <img src={imgIdCard.src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[24px] font-bold font-['Inter']">+2</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button className="bg-[#296341]/80 hover:bg-[#296341] text-white px-10 py-3 rounded-lg font-bold text-[18px] transition-all shadow-md active:scale-95">
                + Add New Vehicle
              </button>
            </div>
          </div>
        </div>

        {/* Cargo Summary Section (Light Green Box) */}
        <div className="mt-16 bg-[#c2dccf] rounded-[40px] p-8 lg:p-12 shadow-inner border-b-8 border-emerald-800/20">

          {/* Cargo Items Rounded Cards */}
          <div className="space-y-4 mb-10 max-w-[1000px]">
            {cargoItemsList.map((item) => (
              <div key={item.id} className="bg-white rounded-xl py-3 px-8 flex items-center shadow-sm group">
                <div className="w-12 h-12 flex items-center justify-center text-[#296341]">
                  {item.icon === 'box' ? <Box /> : <Container />}
                </div>
                <div className="flex-1 text-[20px] font-bold text-gray-700 ml-4">{item.type}</div>
                <div className="text-[20px] font-bold text-gray-600 mr-12">{item.amount}</div>
                <div className="text-[20px] font-bold text-black mr-12">{item.total}</div>
                <div className="flex gap-4">
                  <Edit2 className="w-6 h-6 text-gray-400 group-hover:text-[#296341] cursor-pointer transition-colors" />
                  <Trash2 className="w-6 h-6 text-gray-400 group-hover:text-[#296341] cursor-pointer transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-12">
            <button className="bg-[#296341] text-white px-10 py-3 rounded-lg font-bold text-[18px] uppercase tracking-wider shadow-md hover:bg-emerald-800 transition-colors">
              + ADDITIONAL SERVICES
            </button>
          </div>

          {/* Final Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12 mb-20">
            <div className="space-y-6">
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Name</p>
                <p className="text-[20px] font-black">{contactName}</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Invoice Date</p>
                <p className="text-[20px] font-black">20 / 12 / 2025</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Voyage 209</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Contact no.</p>
                <p className="text-[20px] font-black">{contactPhone}</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Location</p>
                <p className="text-[22px] font-black flex items-center gap-2">NAS <ArrowRight className="w-5 h-5" /> MAH</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentStatus("PAID")}
                  className={`flex-1 py-1 rounded-full font-bold transition-all shadow-sm ${paymentStatus === 'PAID' ? 'bg-[#ff4b4b] text-white' : 'bg-white text-gray-400'}`}
                >
                  PAID
                </button>
                <button
                  onClick={() => setPaymentStatus("UNPAID")}
                  className={`flex-1 py-1 rounded-full font-bold transition-all ${paymentStatus === 'UNPAID' ? 'bg-[#ff4b4b] text-white' : 'bg-white text-gray-400'}`}
                >
                  UNPAID
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Booking Date</p>
                <p className="text-[20px] font-black">20 / 12 / 2025</p>
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-500 uppercase">Invoice No.</p>
                <p className="text-[22px] font-black">#1672870</p>
              </div>
              <input
                placeholder="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full h-[45px] bg-[#e1ece6] rounded-lg px-4 shadow-inner outline-none font-bold text-[#244234]"
              />
            </div>
          </div>

          {/* Overlapping Total Card */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-50 flex flex-col items-center min-w-[320px]">
            <p className="text-[18px] font-bold text-gray-400 tracking-widest uppercase">Total Amount</p>
            <p className="text-[48px] font-black text-black leading-tight">$728.00</p>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">(Including 12% VAT)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-32 flex justify-center gap-8">
          <button className="bg-[#1e4a2e] text-white px-16 py-3 rounded-lg text-[20px] font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95">
            Preview
          </button>
          <button className="bg-[#1e4a2e] text-white px-16 py-3 rounded-lg text-[20px] font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95">
            Save & Send
          </button>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 mt-12">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[75px]" />
          </div>
          <div className="text-white text-[28px] font-semibold">
            Freight Agent | <span className="font-normal">Smith Frank</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CargoBooking() {
  return <CargoBookingContent />;
}
