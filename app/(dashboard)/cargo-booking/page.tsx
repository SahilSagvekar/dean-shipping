"use client";

import { useState, useEffect } from 'react';
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
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import imgCargoShip from "@/app/assets/3f7d36fbe26222b564747f69753922efbd74194d.png";
import imgContainer from "@/app/assets/5edceaf79f7be705450710aa82c190c67fbcaf62.png";
import imgPassport from "@/app/assets/bbad37ee24906289e97d640c601d7cafe55963b5.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

export default function CargoBooking() {
  const { apiFetch, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  // Form State
  const [service, setService] = useState('CONTAINER');
  const [cargoSize, setCargoSize] = useState('Medium');
  const [quantity, setQuantity] = useState("");
  const [pallets, setPallets] = useState("");
  const [type, setType] = useState("DRY");
  const [containerNo, setContainerNo] = useState("");
  const [size, setSize] = useState("");
  const [height, setHeight] = useState("");
  const [reefer, setReefer] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [temperature, setTemperature] = useState("");
  const [decksNo, setDecksNo] = useState("");
  const [boxContains, setBoxContains] = useState("clothing, shoes, non-perishables");

  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const [contactName, setContactName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.mobileNumber || "");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("Passport");

  const [damageFound, setDamageFound] = useState("");
  const [damageLocation, setDamageLocation] = useState("");
  const [comment, setComment] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [remark, setRemark] = useState("");

  const [items, setItems] = useState<any[]>([
    { id: 1, icon: 'box', type: 'DRY BOX(S)', unitPrice: 50, quantity: 3, total: 150, paid: true },
  ]);

  // Fetch Locations
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await apiFetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations);
          if (data.locations.length > 0) {
            setFromLocation(data.locations[0].code);
            if (data.locations.length > 1) setToLocation(data.locations[1].code);
          }
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    }
    fetchLocations();
  }, [apiFetch]);

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!fromLocation || !toLocation || !contactName) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/bookings/cargo', {
        method: 'POST',
        body: JSON.stringify({
          service, cargoSize, quantity, pallets, type, containerNo,
          size, height, reeferNo: reefer, material, color, chassisNo,
          temperature, decksNo, boxContains, bookingDate,
          fromLocation, toLocation,
          contactName, contactEmail, contactPhone, address, idType,
          damageFound, damageLocation, deficiencyComment: comment,
          paymentStatus, remark, items
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Booking created successfully! Invoice: #${data.invoiceNo}`);
        // Optional: redirect or reset form
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create booking");
      }
    } catch (err) {
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cargoRadioTypes = ['Small', 'Medium', 'Large', 'Fragile', 'Hazardous', 'Live'];

  return (
    <div>

      {/* Sidebar and Hamburger are now handled by the dashboard layout */}


      {/* Hero Illustration */}
      <div className="flex justify-center mb-6 px-4 sm:px-8">
        <img
          src={imgCargoShip.src}
          alt="Cargo Booking Illustration"
          className="w-full max-w-[800px] h-auto object-contain"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-32 flex-1 w-full relative">
        {/* Title Section */}
        <div className="mb-6 md:mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-[32px] font-bold text-black tracking-wide">
            <span className="border-b-4 border-black pb-1">CARGO</span> BOOKING
          </h1>
        </div>

        {/* Form Section */}
        <div className="space-y-10 max-w-[1100px]">
          {/* Service Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <label className="text-lg md:text-[20px] font-bold text-gray-800 md:min-w-[80px]">Service</label>
            <div className="relative w-full max-w-[500px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#296341]">
                <Container className="w-5 h-5" />
              </div>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full h-12 md:h-[54px] bg-[#eef6f2] border border-[#d1e5da] rounded-md pl-14 pr-10 text-base md:text-[18px] font-bold text-[#244234] appearance-none outline-none focus:ring-2 focus:ring-[#296341]"
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
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cargoSize === type ? 'border-[#296341]' : 'border-gray-300'
                    }`}
                  onClick={() => setCargoSize(type)}
                >
                  {cargoSize === type && <div className="w-3 h-3 rounded-full bg-[#296341]" />}
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
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.code}>{loc.code} - {loc.name}</option>
                  ))}
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
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.code}>{loc.code} - {loc.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
              </div>
            </div>
          </div>

          {/* Image Gallery UI */}
          <div className="flex flex-col sm:flex-row gap-4 items-start pt-6">
            <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
              <Camera className="w-10 h-10 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
              <Paperclip className="w-10 h-10 text-[#296341] cursor-pointer hover:scale-110 transition-transform" />
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
              <div className="flex-[2] rounded-xl overflow-hidden shadow-md border-2 border-[#296341]/20 aspect-video md:aspect-auto">
                <img src={imgContainer.src} alt="Container main" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-2 gap-2">
                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square"><img src={imgContainer.src} className="w-full h-full object-cover" /></div>
                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square"><img src={imgContainer.src} className="w-full h-full object-cover" /></div>
                <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square"><img src={imgContainer.src} className="w-full h-full object-cover" /></div>
                <div className="rounded-lg overflow-hidden relative group cursor-pointer shadow-sm aspect-square">
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
                  <select value={damageFound} onChange={(e) => setDamageFound(e.target.value)} className="w-full h-[45px] border-b border-gray-300 outline-none focus:border-[#296341] text-[18px] font-bold appearance-none bg-transparent">
                    <option value="">None</option>
                    <option value="Broken">Broken</option>
                    <option value="Scratched">Scratched</option>
                    <option value="Dented">Dented</option>
                    <option value="Wet">Wet</option>
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
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-6">
            <button className="bg-[#132540] text-white px-8 md:px-12 py-3 rounded-lg text-lg md:text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 flex items-center justify-center gap-3">
              <Plus className="w-6 h-6" /> ADD ITEM
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#132540] text-white px-8 md:px-16 py-3 rounded-lg text-lg md:text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "SUBMIT"}
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
            <div className="flex flex-col sm:flex-row gap-4 items-start pt-6">
              <div className="flex sm:flex-col gap-4 mt-2 w-full sm:w-auto justify-center">
                <Camera className="w-10 h-10 text-[#296341] cursor-pointer" />
                <Paperclip className="w-10 h-10 text-[#296341] cursor-pointer" />
              </div>
              <div className="flex flex-col md:flex-row gap-4 flex-1 items-center w-full">
                <div className="w-full md:w-[200px] aspect-[3/4] md:h-[260px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                  <img src={imgPassport.src} className="w-full h-full object-cover" />
                </div>
                <div className="w-full md:w-[200px] aspect-[3/4] md:h-[260px] rounded-xl overflow-hidden border-2 border-emerald-100 shadow-md">
                  <img src={imgPassport.src} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-rows-2 grid-cols-2 gap-4 h-auto md:h-[260px] w-full md:w-auto">
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square md:w-[140px]"><img src={imgIdCard.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square md:w-[140px]"><img src={imgPassport.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square md:w-[140px]"><img src={imgIdCard.src} className="w-full h-full object-cover" /></div>
                  <div className="rounded-lg overflow-hidden relative aspect-square md:w-[140px] shadow-sm border border-gray-100">
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
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center shadow-sm group gap-4 sm:gap-0">
                <div className="w-12 h-12 flex items-center justify-center text-[#296341]">
                  {item.icon === 'box' || item.type.includes('BOX') ? <Box /> : <Container />}
                </div>
                <div className="flex-1 text-lg md:text-[20px] font-bold text-gray-700 sm:ml-4 text-center sm:text-left">{item.type} {item.unitPrice ? `($${item.unitPrice})` : ''} x {item.quantity}</div>
                <div className="text-[20px] font-black text-black sm:mr-12 underline sm:no-underline">${(item.total || item.unitPrice * item.quantity).toLocaleString()}</div>
                <div className="flex gap-6 sm:gap-4">
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
          <div className="static md:absolute md:left-1/2 md:-translate-x-1/2 md:-bottom-16 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-gray-50 flex flex-col items-center w-full md:min-w-[320px] mt-8 md:mt-0">
            <p className="text-[16px] md:text-[18px] font-bold text-gray-400 tracking-widest uppercase">Total Amount</p>
            <p className="text-[36px] md:text-[48px] font-black text-black leading-tight">$728.00</p>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">(Including 12% VAT)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-16 md:mt-32 flex flex-col sm:flex-row justify-center gap-4 md:gap-8">
          <button className="bg-[#1e4a2e] text-white px-12 md:px-16 py-3 rounded-lg text-lg md:text-[20px] font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95">
            Preview
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#1e4a2e] text-white px-12 md:px-16 py-3 rounded-lg text-lg md:text-[20px] font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Save & Send
          </button>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-6 md:py-8 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd." className="h-12 md:h-[75px]" />
          </div>
          <div className="text-white text-xl md:text-[28px] font-semibold text-center md:text-left">
            Freight Agent | <span className="font-normal">Smith Frank</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
