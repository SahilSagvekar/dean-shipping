"use client";

import { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Loader2,
  X,
  Briefcase,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  CreditCard,
  Lock,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import imgBookingIllustration from "@/app/assets/cfa31b3ce2eb14a48a0ef2738b4164b16c74ab53.png";
import imgDriversLicense from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

interface Location {
  id: string;
  code: string;
  name: string;
}

interface LuggageItem {
  id: number;
  type: string;
  weight: number;
  quantity: number;
  price: number;
}

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  preview?: string;
}

// Pricing configuration
const PRICING = {
  infant: 0,      // Free
  child: 45,      // $45 per child
  adult: 65,      // $65 per adult
  luggage: {
    'CARRY_ON': 0,
    'CHECKED_BAG': 25,
    'OVERSIZED': 50,
    'SPECIAL': 75,
  } as Record<string, number>,
  vatRate: 0.12,  // 12% VAT
};

function PassengerBookingContent() {
  const { apiFetch, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [upcomingVoyages, setUpcomingVoyages] = useState<any[]>([]);
  const [selectedVoyageId, setSelectedVoyageId] = useState("");
  const [isLoadingVoyages, setIsLoadingVoyages] = useState(false);

  // Passenger counts
  const [infantCount, setInfantCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [adultCount, setAdultCount] = useState(1);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [idType, setIdType] = useState("Passport");
  const [remark, setRemark] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");

  // Luggage
  const [luggageItems, setLuggageItems] = useState<LuggageItem[]>([]);
  const [showLuggageModal, setShowLuggageModal] = useState(false);
  const [editingLuggage, setEditingLuggage] = useState<LuggageItem | null>(null);
  const [newLuggageType, setNewLuggageType] = useState("CHECKED_BAG");
  const [newLuggageWeight, setNewLuggageWeight] = useState("");
  const [newLuggageQuantity, setNewLuggageQuantity] = useState("1");

  // Image uploads
  const [idImages, setIdImages] = useState<UploadedImage[]>([]);
  const idImageRef = useRef<HTMLInputElement>(null);

  // Created booking
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  // NOTE: Do NOT auto-fill with logged-in user details.
  // This form is for booking customers/passengers, not the logged-in agent.

  // Fetch locations
  useEffect(() => {
    async function fetchLocations() {
      setIsLoadingLocations(true);
      try {
        const res = await apiFetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
          if (data.locations && data.locations.length > 0) {
            setFromLocation(data.locations[0].code);
            if (data.locations.length > 1) {
              setToLocation(data.locations[1].code);
            }
          }
        } else {
          toast.error("Failed to load locations");
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        toast.error("Failed to load locations");
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
  }, [apiFetch]);

  // Fetch upcoming voyages
  useEffect(() => {
    async function fetchVoyages() {
      setIsLoadingVoyages(true);
      try {
        const res = await apiFetch('/api/voyages?upcoming=true&limit=50');
        if (res.ok) {
          const data = await res.json();
          setUpcomingVoyages(data.voyages || []);
        }
      } catch (err) {
        console.error("Failed to fetch voyages:", err);
      } finally {
        setIsLoadingVoyages(false);
      }
    }
    fetchVoyages();
  }, [apiFetch]);

  // Calculate totals
  const calculateTotals = () => {
    const passengerTotal =
      (infantCount * PRICING.infant) +
      (childCount * PRICING.child) +
      (adultCount * PRICING.adult);

    const luggageTotal = luggageItems.reduce((sum, item) => {
      const pricePerItem = PRICING.luggage[item.type] || 0;
      return sum + (pricePerItem * item.quantity);
    }, 0);

    const subtotal = passengerTotal + luggageTotal;
    const vatAmount = subtotal * PRICING.vatRate;
    const grandTotal = subtotal + vatAmount;

    return { passengerTotal, luggageTotal, subtotal, vatAmount, grandTotal };
  };

  const { passengerTotal, luggageTotal, subtotal, vatAmount, grandTotal } = calculateTotals();
  const totalPassengers = infantCount + childCount + adultCount;

  // Image upload handler
  const handleIdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: '',
          file,
          preview,
        });
      }
    });

    setIdImages([...idImages, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);

    if (idImageRef.current) {
      idImageRef.current.value = '';
    }
  };

  const removeIdImage = (id: string) => {
    setIdImages(idImages.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  // Upload image to server
  const uploadImage = async (
    file: File,
    bookingId: string,
    imageType: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('imageType', imageType);
    formData.append('bookingType', 'passenger');

    const res = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.url;
    }

    const text = await res.text();
    let errorMsg = "Upload failed";
    try {
      const errorData = JSON.parse(text);
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      if (text.includes("<!DOCTYPE html>")) {
        errorMsg = "Upload failed with a server error (HTML). Check your session.";
      }
    }
    throw new Error(errorMsg);
  };

  // Luggage handlers
  const handleAddLuggage = () => {
    if (!newLuggageQuantity) {
      toast.error("Please enter quantity");
      return;
    }

    const qty = parseInt(newLuggageQuantity);
    const weight = parseFloat(newLuggageWeight) || 0;
    const price = (PRICING.luggage[newLuggageType] || 0) * qty;

    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (editingLuggage) {
      setLuggageItems(luggageItems.map(item =>
        item.id === editingLuggage.id
          ? { ...item, type: newLuggageType, weight, quantity: qty, price }
          : item
      ));
      toast.success("Luggage updated");
    } else {
      const newItem: LuggageItem = {
        id: Date.now(),
        type: newLuggageType,
        weight,
        quantity: qty,
        price,
      };
      setLuggageItems([...luggageItems, newItem]);
      toast.success("Luggage added");
    }

    setShowLuggageModal(false);
    setEditingLuggage(null);
    setNewLuggageType("CHECKED_BAG");
    setNewLuggageWeight("");
    setNewLuggageQuantity("1");
  };

  const handleEditLuggage = (item: LuggageItem) => {
    setEditingLuggage(item);
    setNewLuggageType(item.type);
    setNewLuggageWeight(item.weight.toString());
    setNewLuggageQuantity(item.quantity.toString());
    setShowLuggageModal(true);
  };

  const handleDeleteLuggage = (itemId: number) => {
    setLuggageItems(luggageItems.filter(item => item.id !== itemId));
    toast.success("Luggage removed");
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!name.trim()) errors.push("Please enter passenger name");
    if (!bookingDate) errors.push("Please select a booking date");
    if (!fromLocation) errors.push("Please select departure location");
    if (!toLocation) errors.push("Please select destination");
    if (fromLocation && toLocation && fromLocation === toLocation) {
      errors.push("Departure and destination cannot be the same");
    }
    if (totalPassengers === 0) errors.push("Please add at least one passenger");

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    return true;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        infantCount,
        childCount,
        adultCount,
        name: name.trim(),
        email: email || null,
        contact: contact || null,
        bookingDate,
        fromLocation,
        toLocation,
        voyageId: selectedVoyageId || null,
        idType,
        paymentStatus,
        remark: remark || null,
        totalAmount: subtotal, // Pre-VAT amount, API will add VAT
        luggage: luggageItems.map(item => ({
          type: item.type,
          weight: item.weight,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("Submitting payload:", payload);

      const res = await apiFetch('/api/bookings/passenger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Failed to create booking";
        try {
          const data = JSON.parse(text);
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err: string) => toast.error(err));
            setIsSubmitting(false);
            return;
          }
          errorMsg = data.error || errorMsg;
        } catch (e) {
          if (text.includes("<!DOCTYPE html>")) {
            errorMsg = "Server returned an error page. You may need to log out and log back in (especially if you recently switched databases).";
          }
        }
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      console.log("Response:", data);

      // Upload ID images after booking creation
      const bookingId = data.booking.id;
      let uploadErrors = 0;

      for (const img of idImages) {
        if (img.file) {
          try {
            await uploadImage(img.file, bookingId, 'USER_DOCUMENT');
          } catch (error: any) {
            console.error('Failed to upload ID image:', error);
            toast.error(`Image upload failed: ${error.message || 'Unknown error'}`);
            uploadErrors++;
          }
        }
      }

      setCreatedBooking(data);

      if (uploadErrors > 0) {
        toast.success(`Booking created! Invoice: #${data.invoiceNo}`);
        toast.warning(`${uploadErrors} image(s) failed to upload`);
      } else {
        toast.success(`Booking created successfully! Invoice: #${data.invoiceNo}`);
      }

      // Reset form after successful submission
      setName("");
      setEmail("");
      setContact("");
      setInfantCount(0);
      setChildCount(0);
      setAdultCount(1);
      setBookingDate(new Date().toISOString().split('T')[0]);
      setSelectedVoyageId("");
      setIdType("Passport");
      setRemark("");
      setPaymentStatus("UNPAID");
      setLuggageItems([]);
      setIdImages([]);
      if (locations.length > 0) {
        setFromLocation(locations[0].code);
        if (locations.length > 1) {
          setToLocation(locations[1].code);
        }
      }
      // Scroll to bottom where Pay Now card appears
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pay Now via Stripe
  const handlePayNow = async (invoiceNo: string) => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to initiate payment");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  // Reset form
  const resetForm = () => {
    if (luggageItems.length > 0 || idImages.length > 0 || name || email || contact) {
      if (!confirm("Are you sure you want to reset? All data will be lost.")) {
        return;
      }
    }

    setName("");
    setEmail("");
    setContact("");
    setInfantCount(0);
    setChildCount(0);
    setAdultCount(1);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setSelectedVoyageId("");
    setIdType("Passport");
    setRemark("");
    setPaymentStatus("UNPAID");
    setLuggageItems([]);
    setIdImages([]);
    setCreatedBooking(null);

    if (locations.length > 0) {
      setFromLocation(locations[0].code);
      if (locations.length > 1) {
        setToLocation(locations[1].code);
      }
    }

    toast.success("Form has been reset");
  };

  const luggageTypes = [
    { value: 'CARRY_ON', label: 'Carry-on (Free)' },
    { value: 'CHECKED_BAG', label: 'Checked Bag ($25)' },
    { value: 'OVERSIZED', label: 'Oversized ($50)' },
    { value: 'SPECIAL', label: 'Special Items ($75)' },
  ];

  const idTypes = ['Passport', "Driver's License", 'National ID', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hidden file input */}
      <input
        type="file"
        ref={idImageRef}
        onChange={handleIdImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Hero Illustration */}
      <div className="flex justify-center px-4 sm:px-8 bg-[#effaf6] py-6 sm:py-10 border-b border-[#296341]/10">
        <img
          src={imgBookingIllustration.src}
          alt="Passenger Booking Illustration"
          className="w-full max-w-[800px] h-auto object-contain max-h-[220px] sm:max-h-[300px] md:max-h-none hover:scale-105 transition-transform duration-700"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16 md:pb-32 flex-1 w-full relative pt-8 sm:pt-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Left Column: Form Details */}
          <div className="w-full lg:w-[60%] space-y-6 md:space-y-8">
            {/* Title Section */}
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight uppercase">
                PASSENGER <span className="text-[#296341]">BOOKING</span>
              </h1>
              <div className="w-32 h-1.5 bg-black rounded-full mt-4 mx-auto lg:mx-0" />
              <p className="text-gray-500 mt-6 text-sm sm:text-base font-medium italic">Register new passengers and manage their travel details with precision.</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-800">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                />
              </div>

              {/* Contact and Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-800">Contact</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-800">
                    Booking Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
              </div>
            </div>

            {/* Passenger Counter Section */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Passenger Selection <span className="text-red-500">*</span></h3>
              {[
                { label: "Infant (0 - 2 yr old)", sublabel: "Complimentary Traveling", count: infantCount, setCount: setInfantCount, icon: Baby },
                { label: "Child (3 - 12 yr old)", sublabel: `$${PRICING.child}/person fare`, count: childCount, setCount: setChildCount, icon: Users },
                { label: "Adult (13+ yr old)", sublabel: `$${PRICING.adult}/person fare`, count: adultCount, setCount: setAdultCount, icon: User }
              ].map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white border border-gray-100 p-4 sm:p-5 rounded-2xl shadow-sm transition-all hover:border-[#296341]/30 hover:shadow-md group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-[#effaf6] rounded-xl group-hover:scale-110 transition-transform">
                      <group.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#296341]" />
                    </div>
                    <div>
                      <span className="text-lg sm:text-[20px] font-black text-[#132540] leading-tight block">{group.label}</span>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{group.sublabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center border-2 border-[#132540] rounded-full overflow-hidden bg-white w-full sm:w-[160px] h-14">
                    <button
                      onClick={() => group.setCount(Math.max(0, group.count - 1))}
                      className="flex-1 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors active:scale-90"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-[50px] text-center text-xl sm:text-2xl font-black text-[#132540]">{group.count}</span>
                    <button
                      onClick={() => group.setCount(group.count + 1)}
                      className="flex-1 h-full flex items-center justify-center hover:bg-[#effaf6] text-[#296341] transition-colors active:scale-90"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Voyage Picker */}
            <div className="space-y-4 mt-8 bg-[#132540]/5 p-6 rounded-2xl border border-dashed border-[#132540]/20">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                Voyage Assignment <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedVoyageId}
                  onChange={(e) => {
                    const vid = e.target.value;
                    setSelectedVoyageId(vid);
                    if (!vid) {
                      // Cleared selection — reset to default locations
                      if (locations.length > 0) {
                        setFromLocation(locations[0].code);
                        if (locations.length > 1) {
                          setToLocation(locations[1].code);
                        }
                      }
                      return;
                    }
                    const v = upcomingVoyages.find(voy => voy.id === vid);
                    if (v) {
                      // Set booking date from voyage
                      try {
                        setBookingDate(new Date(v.date).toISOString().split('T')[0]);
                      } catch (e) {
                        console.error("Error parsing voyage date:", e);
                      }

                      // Build ordered location list from stops
                      const voyageLocations: { code: string; name: string }[] = [];

                      // Add from location
                      if (v.from) {
                        voyageLocations.push(v.from);
                      }

                      // Add stops in order
                      if (v.stops && v.stops.length > 0) {
                        const sortedStops = [...v.stops].sort(
                          (a: any, b: any) => (a.stopOrder || 0) - (b.stopOrder || 0)
                        );
                        sortedStops.forEach((s: any) => {
                          if (!voyageLocations.find(l => l.code === s.location.code)) {
                            voyageLocations.push(s.location);
                          }
                        });
                      }

                      // Add to location
                      if (v.to && !voyageLocations.find((l: any) => l.code === v.to.code)) {
                        voyageLocations.push(v.to);
                      }

                      // Set from = first, to = last
                      if (voyageLocations.length >= 2) {
                        setFromLocation(voyageLocations[0].code);
                        setToLocation(voyageLocations[voyageLocations.length - 1].code);
                      } else if (voyageLocations.length === 1) {
                        setFromLocation(voyageLocations[0].code);
                      }
                    }
                  }}
                  disabled={isLoadingVoyages}
                  className="w-full h-14 bg-white border-2 border-[#132540] rounded-xl px-6 shadow-sm appearance-none outline-none focus:ring-4 focus:ring-[#296341]/10 text-lg font-black text-[#132540] disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">SELECT UPCOMING VOYAGE</option>
                  {upcomingVoyages.map(v => (
                    <option key={v.id} value={v.id}>
                      VOYAGE #{v.voyageNo} — {v.shipName} ({new Date(v.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#296341] w-6 h-6 pointer-events-none" />
              </div>
              {isLoadingVoyages && (
                <div className="flex items-center gap-2 text-gray-400 font-bold italic text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#296341]" /> Synchronizing voyage schedules...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 pt-4">
              <div className="flex-1 space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="text-[#296341] w-4 h-4" /> Port of Departure <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    disabled={isLoadingLocations}
                    className="w-full h-14 bg-white border-2 border-[#132540] rounded-xl px-6 shadow-sm appearance-none outline-none focus:ring-4 focus:ring-[#296341]/10 text-lg font-black text-[#132540] disabled:bg-gray-100"
                  >
                    {isLoadingLocations ? (
                      <option>LOADING PORTS...</option>
                    ) : locations.length === 0 ? (
                      <option>NO PORTS AVAILABLE</option>
                    ) : (
                      // If a voyage is selected, build full location list from from/stops/to
                      (() => {
                        if (!selectedVoyageId) return locations;
                        const v = upcomingVoyages.find(voy => voy.id === selectedVoyageId);
                        if (!v) return locations;

                        const voyageLocs: any[] = [];
                        if (v.from) voyageLocs.push(v.from);
                        if (v.stops && v.stops.length > 0) {
                          [...v.stops]
                            .sort((a: any, b: any) => (a.stopOrder || 0) - (b.stopOrder || 0))
                            .forEach((s: any) => {
                              if (!voyageLocs.find((l: any) => l.code === s.location.code)) {
                                voyageLocs.push(s.location);
                              }
                            });
                        }
                        if (v.to && !voyageLocs.find((l: any) => l.code === v.to.code)) {
                          voyageLocs.push(v.to);
                        }
                        return voyageLocs.length > 0 ? voyageLocs : locations;
                      })().map((loc: any) => (
                        <option key={loc.id || loc.code} value={loc.code}>{loc.code} — {loc.name}</option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#296341] w-6 h-6 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="text-[#296341] w-4 h-4" /> Destination Port <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    disabled={isLoadingLocations}
                    className="w-full h-14 bg-white border-2 border-[#132540] rounded-xl px-6 shadow-sm appearance-none outline-none focus:ring-4 focus:ring-[#296341]/10 text-lg font-black text-[#132540] disabled:bg-gray-100"
                  >
                    {isLoadingLocations ? (
                      <option>LOADING PORTS...</option>
                    ) : locations.length === 0 ? (
                      <option>NO PORTS AVAILABLE</option>
                    ) : (
                      // Same logic for destination
                      (() => {
                        if (!selectedVoyageId) return locations;
                        const v = upcomingVoyages.find(voy => voy.id === selectedVoyageId);
                        if (!v) return locations;

                        const voyageLocs: any[] = [];
                        if (v.from) voyageLocs.push(v.from);
                        if (v.stops && v.stops.length > 0) {
                          [...v.stops]
                            .sort((a: any, b: any) => (a.stopOrder || 0) - (b.stopOrder || 0))
                            .forEach((s: any) => {
                              if (!voyageLocs.find((l: any) => l.code === s.location.code)) {
                                voyageLocs.push(s.location);
                              }
                            });
                        }
                        if (v.to && !voyageLocs.find((l: any) => l.code === v.to.code)) {
                          voyageLocs.push(v.to);
                        }
                        return voyageLocs.length > 0 ? voyageLocs : locations;
                      })().map((loc: any) => (
                        <option key={loc.id || loc.code} value={loc.code}>{loc.code} — {loc.name}</option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#296341] w-6 h-6 pointer-events-none" />
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
                    {idTypes.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
              </div>

              {/* ID Image Gallery */}
              <div className="flex flex-col sm:flex-row gap-6 items-start py-4">
                <div className="flex sm:flex-col gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => idImageRef.current?.click()}
                    className="flex-1 sm:w-14 sm:h-14 py-3 sm:py-0 flex items-center justify-center bg-[#eef6f2] rounded-xl hover:bg-[#d1e5da] transition-all border border-[#296341]/10 group"
                  >
                    <Camera className="w-6 h-6 text-[#296341] group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => idImageRef.current?.click()}
                    className="flex-1 sm:w-14 sm:h-14 py-3 sm:py-0 flex items-center justify-center bg-[#eef6f2] rounded-xl hover:bg-[#d1e5da] transition-all border border-[#296341]/10 group"
                  >
                    <Paperclip className="w-6 h-6 text-[#296341] group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-4 flex-1 w-full">
                  {idImages.length === 0 ? (
                    <div
                      onClick={() => idImageRef.current?.click()}
                      className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Click to upload {idType} images</p>
                    </div>
                  ) : (
                    <>
                      {idImages.map((img, index) => (
                        <div key={img.id} className="relative w-[150px] h-[200px] rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                          <img
                            src={img.preview || img.url || imgDriversLicense.src}
                            alt={`${idType} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeIdImage(img.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                            {idType}
                          </div>
                        </div>
                      ))}
                      {idImages.length < 4 && (
                        <div
                          onClick={() => idImageRef.current?.click()}
                          className="w-[150px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#296341] transition-colors"
                        >
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Luggage Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#296341]" /> Luggage
                  </h3>
                  <button
                    onClick={() => {
                      setEditingLuggage(null);
                      setNewLuggageType("CHECKED_BAG");
                      setNewLuggageWeight("");
                      setNewLuggageQuantity("1");
                      setShowLuggageModal(true);
                    }}
                    className="bg-[#296341]/80 hover:bg-[#296341] text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Luggage
                  </button>
                </div>

                {luggageItems.length > 0 && (
                  <div className="space-y-2">
                    {luggageItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg py-3 px-4 flex items-center shadow-sm group">
                        <Briefcase className="w-5 h-5 text-[#296341] mr-3" />
                        <div className="flex-1">
                          <span className="font-bold text-gray-700">
                            {luggageTypes.find(t => t.value === item.type)?.label || item.type}
                          </span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          {item.weight > 0 && (
                            <span className="text-gray-400 text-sm ml-2">({item.weight}kg)</span>
                          )}
                        </div>
                        <span className="font-bold text-gray-700 mr-4">${item.price}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2
                            onClick={() => handleEditLuggage(item)}
                            className="w-5 h-5 text-gray-400 hover:text-[#296341] cursor-pointer"
                          />
                          <Trash2
                            onClick={() => handleDeleteLuggage(item.id)}
                            className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm md:text-[16px] font-bold text-gray-500 sm:w-16">Name</label>
                    <div className="flex-1 h-10 md:h-[45px] bg-white rounded-lg px-4 shadow-sm flex items-center font-bold text-sm md:text-base truncate">
                      {name || '-'}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm md:text-[16px] font-bold text-gray-500 sm:w-16">Email</label>
                    <div className="flex-1 h-10 md:h-[45px] bg-white rounded-lg px-4 shadow-sm flex items-center font-bold text-sm md:text-base truncate">
                      {email || '-'}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm md:text-[16px] font-bold text-gray-500 sm:w-16">Contact</label>
                    <div className="flex-1 h-10 md:h-[45px] bg-white rounded-lg px-4 shadow-sm flex items-center font-bold text-sm md:text-base">
                      {contact || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mb-8">
                <h3 className="text-center font-black text-lg md:text-[20px] tracking-widest text-[#244234]">BOOKING SUMMARY</h3>

                <div className="bg-white/50 rounded-xl p-4 space-y-2">
                  {adultCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Adult x {adultCount}</span>
                      <span className="font-bold">${adultCount * PRICING.adult}</span>
                    </div>
                  )}
                  {childCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Child x {childCount}</span>
                      <span className="font-bold">${childCount * PRICING.child}</span>
                    </div>
                  )}
                  {infantCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Infant x {infantCount}</span>
                      <span className="font-bold">Free</span>
                    </div>
                  )}
                  {luggageItems.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      {luggageItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{luggageTypes.find(t => t.value === item.type)?.label.split(' (')[0]} x {item.quantity}</span>
                          <span className="font-bold">${item.price}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Total Amount Grid */}
              <div className="space-y-8 pb-32">
                <div className="grid grid-cols-3 gap-3 md:gap-6 text-center">
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Passengers</p>
                    <p className="text-lg md:text-[22px] font-black">{totalPassengers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Invoice No.</p>
                    <p className="text-lg md:text-[22px] font-black">
                      {createdBooking?.invoiceNo ? `#${createdBooking.invoiceNo}` : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Date</p>
                    <p className="text-lg md:text-[22px] font-black">
                      {bookingDate ? new Date(bookingDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: '2-digit', year: '2-digit'
                      }).replace(/\//g, '/') : '-'}
                    </p>
                  </div>
                </div>

                {/* Location row */}
                <div className="space-y-4">
                  <p className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase">Route</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xl md:text-[24px] font-black flex items-center gap-3">
                      {fromLocation || '-'} <ArrowRight className="text-[#296341]" /> {toLocation || '-'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentStatus("PAID")}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${paymentStatus === 'PAID' ? 'bg-[#2ecc71] text-white' : 'bg-white text-gray-400'}`}
                      >
                        PAID
                      </button>
                      <button
                        onClick={() => setPaymentStatus("UNPAID")}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-full font-bold text-sm transition-all ${paymentStatus === 'UNPAID' ? 'bg-[#ff4b4b] text-white' : 'bg-white text-gray-400'}`}
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

              {/* Overlapping Total Card */}
              <div className="mt-8 md:mt-0 md:absolute md:left-[10%] md:right-[10%] md:-bottom-24 bg-white rounded-[32px] p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col items-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Total Amount</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-[#296341] opacity-60">$</span>
                  <p className="text-4xl md:text-6xl font-black text-[#132540] tracking-tight leading-tight">
                    {grandTotal.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-center">
                    VAT SURCHARGE ({PRICING.vatRate * 100}%) INCLUDED
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 bg-gray-100 px-6 py-2 rounded-full border border-gray-200/50">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#296341]" /> Sub: ${subtotal.toFixed(0)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Tax: ${vatAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 md:mt-40 space-y-4">
              {/* Success Card with Pay Now */}
              {createdBooking?.invoiceNo && (
                <div className="bg-white rounded-2xl border-2 border-[#296341] p-6 shadow-lg space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#296341] rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-[#296341]">Booking Created!</p>
                      <p className="text-sm text-gray-500">Invoice #{createdBooking.invoiceNo}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                      <p className="text-2xl font-black text-[#132540]">${grandTotal.toFixed(2)}</p>
                    </div>
                    <p className="text-[10px] text-[#296341] font-black bg-[#296341]/10 px-3 py-1 rounded-full uppercase">
                      12% VAT Included
                    </p>
                  </div>

                  <button
                    onClick={() => handlePayNow(createdBooking.invoiceNo)}
                    disabled={isPaying}
                    className="w-full h-14 bg-[#296341] hover:bg-[#1e4c30] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-[#296341]/20"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting to Stripe…
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Now via Stripe
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      Secured by <span className="font-semibold text-gray-500">Stripe</span>. Card details never stored.
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !!createdBooking}
                className="w-full bg-[#132540] py-4 md:py-5 rounded-xl md:rounded-2xl text-white text-xl md:text-[24px] font-black tracking-widest hover:bg-[#1a3254] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-6 h-6 animate-spin" />}
                {isSubmitting ? 'SUBMITTING...' : createdBooking ? 'SUBMITTED ✓' : 'SUBMIT'}
              </button>
              <button
                onClick={resetForm}
                className="w-full bg-gray-200 py-3 rounded-xl text-gray-600 text-lg font-bold hover:bg-gray-300 transition-all"
              >
                {createdBooking ? 'New Booking' : 'Reset Form'}
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

      {/* Luggage Modal */}
      {showLuggageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[450px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] font-bold text-[#296341]">
                {editingLuggage ? 'Edit Luggage' : 'Add Luggage'}
              </h3>
              <button
                onClick={() => {
                  setShowLuggageModal(false);
                  setEditingLuggage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-gray-500">Luggage Type</label>
                <div className="relative">
                  <select
                    value={newLuggageType}
                    onChange={(e) => setNewLuggageType(e.target.value)}
                    className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-[18px] font-bold appearance-none outline-none focus:ring-2 focus:ring-[#296341]"
                  >
                    {luggageTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-gray-500">Weight (kg)</label>
                  <input
                    type="number"
                    value={newLuggageWeight}
                    onChange={(e) => setNewLuggageWeight(e.target.value)}
                    placeholder="Optional"
                    min="0"
                    step="0.1"
                    className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-[18px] outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-gray-500">Quantity</label>
                  <input
                    type="number"
                    value={newLuggageQuantity}
                    onChange={(e) => setNewLuggageQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-[18px] outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
              </div>

              {newLuggageQuantity && (
                <div className="bg-[#eef6f2] rounded-lg p-4 text-center">
                  <p className="text-[14px] text-gray-500">Total</p>
                  <p className="text-[28px] font-black text-[#296341]">
                    ${((PRICING.luggage[newLuggageType] || 0) * parseInt(newLuggageQuantity || '0')).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowLuggageModal(false);
                    setEditingLuggage(null);
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLuggage}
                  className="flex-1 py-3 rounded-lg bg-[#296341] text-white font-bold hover:bg-emerald-800 transition-colors"
                >
                  {editingLuggage ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PassengerBooking() {
  return <PassengerBookingContent />;
}