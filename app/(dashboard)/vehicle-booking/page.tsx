"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Camera,
  Paperclip,
  MapPin,
  ChevronDown,
  Check,
  ArrowRight,
  Ship,
  Calendar,
  Loader2,
  DollarSign,
  Eye,
  X,
} from "lucide-react";
import  DashboardBanner from "@/components/ui/DashboardBanner";
import imgIllustration from "@/app/assets/fc4d24c0a5d260c8ee523edd7416ec133186b7d1.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// ── Types ──────────────────────────────────────────────

interface Location {
  id: string;
  code: string;
  name: string;
}

interface VoyageStop {
  stopOrder: number;
  location: { id: string; code: string; name: string };
  arrivalTime: string | null;
  departureTime: string | null;
}

interface Voyage {
  id: string;
  voyageNo: number;
  shipName: string;
  date: string;
  status: string;
  stops: VoyageStop[];
  from?: { code: string; name: string } | null;
  to?: { code: string; name: string } | null;
}

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  preview?: string;
}

// ──────────────────────────────────────────────────────

function VehicleBookingContent() {
  const { apiFetch, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [upcomingVoyages, setUpcomingVoyages] = useState<Voyage[]>([]);
  const [selectedVoyageId, setSelectedVoyageId] = useState("");
  const [isLoadingVoyages, setIsLoadingVoyages] = useState(false);

  // Vehicle info
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [nonRunning, setNonRunning] = useState(false);
  const [comments, setComments] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [idType, setIdType] = useState("DRIVER'S LICENCE");

  // Payment
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [remark, setRemark] = useState("");

  // Images
  const [vehicleImages, setVehicleImages] = useState<UploadedImage[]>([]);
  const [idImages, setIdImages] = useState<UploadedImage[]>([]);
  const vehicleImageRef = useRef<HTMLInputElement>(null);
  const idImageRef = useRef<HTMLInputElement>(null);

  // Created result
  const [createdVehicle, setCreatedVehicle] = useState<any>(null);

  // ── Set user details ─────────────────────────────────
  useEffect(() => {
    if (user) {
      setContactName(
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      );
      setContactEmail(user.email || "");
      setContactPhone(user.mobileNumber || "");
    }
  }, [user]);

  // ── Fetch locations ──────────────────────────────────
  useEffect(() => {
    async function fetchLocations() {
      setIsLoadingLocations(true);
      try {
        const res = await apiFetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
          if (data.locations && data.locations.length > 0) {
            setFromLocation(data.locations[0].code);
            if (data.locations.length > 1) {
              setToLocation(data.locations[1].code);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      } finally {
        setIsLoadingLocations(false);
      }
    }
    fetchLocations();
  }, [apiFetch]);

  // ── Fetch upcoming voyages ───────────────────────────
  useEffect(() => {
    async function fetchVoyages() {
      setIsLoadingVoyages(true);
      try {
        const res = await apiFetch("/api/voyages?upcoming=true&limit=50");
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

  // ── Voyage selection handler ─────────────────────────
  const handleVoyageSelect = (voyageId: string) => {
    setSelectedVoyageId(voyageId);
    if (!voyageId) return;

    const voyage = upcomingVoyages.find((v) => v.id === voyageId);
    if (!voyage) return;

    // Auto-fill date
    setBookingDate(new Date(voyage.date).toISOString().split("T")[0]);

    // Auto-fill from/to using stops
    if (voyage.stops && voyage.stops.length >= 2) {
      setFromLocation(voyage.stops[0].location.code);
      setToLocation(voyage.stops[voyage.stops.length - 1].location.code);
    } else if (voyage.from && voyage.to) {
      setFromLocation(voyage.from.code);
      setToLocation(voyage.to.code);
    }
  };

  // ── Get available locations (filtered by voyage) ─────
  const getAvailableLocations = (): Location[] => {
    if (selectedVoyageId) {
      const voyage = upcomingVoyages.find((v) => v.id === selectedVoyageId);
      if (voyage && voyage.stops && voyage.stops.length > 0) {
        return voyage.stops.map((s) => s.location);
      }
    }
    return locations;
  };

  const availableLocations = getAvailableLocations();

  // ── Image handlers ───────────────────────────────────
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
    images: UploadedImage[]
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: "",
          file,
          preview,
        });
      }
    });

    setImages([...images, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);
  };

  // ── Pricing ──────────────────────────────────────────
  const basePrice = 300;
  const nonRunningFee = nonRunning ? 75 : 0;
  const subtotal = basePrice + nonRunningFee;
  const vatAmount = subtotal * 0.12;
  const total = subtotal + vatAmount;

  // ── Validation ───────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!licensePlate.trim()) errors.push("License plate is required");
    if (!contactName.trim()) errors.push("Owner name is required");
    if (!vehicleType.trim()) errors.push("Vehicle type is required");
    if (!fromLocation) errors.push("From location is required");
    if (!toLocation) errors.push("To location is required");
    if (!bookingDate) errors.push("Booking date is required");
    if (fromLocation && toLocation && fromLocation === toLocation) {
      errors.push("From and To locations cannot be the same");
    }

    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
      return false;
    }
    return true;
  };

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        registrationNo: licensePlate.trim(),
        ownerName: contactName.trim(),
        ownerEmail: contactEmail || null,
        contactNo: contactPhone || "",
        vehicleType: `${vehicleType}${make || model ? ` - ${make} ${model}`.trim() : ""
          }`,
        fromLocation,
        toLocation,
        bookingDate,
        voyageId: selectedVoyageId || null,
        notes: [
          nonRunning ? "NON-RUNNING VEHICLE" : "",
          comments,
          remark,
        ].filter(Boolean).join(" | ") || null,
      };

      const res = await apiFetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(data.error || "Failed to add vehicle");
        }
        return;
      }

      setCreatedVehicle(data);
      toast.success(
        `Vehicle ${data.vehicle.registrationNo} added to waitlist!`
      );
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset ────────────────────────────────────────────
  const resetForm = () => {
    setMake("");
    setModel("");
    setLicensePlate("");
    setVehicleType("CAR");
    setBookingDate(new Date().toISOString().split("T")[0]);
    setNonRunning(false);
    setComments("");
    setPaymentStatus("UNPAID");
    setRemark("");
    setVehicleImages([]);
    setIdImages([]);
    setCreatedVehicle(null);
    setSelectedVoyageId("");

    if (user) {
      setContactName(
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      );
      setContactEmail(user.email || "");
      setContactPhone(user.mobileNumber || "");
    }

    if (locations.length > 0) {
      setFromLocation(locations[0].code);
      if (locations.length > 1) {
        setToLocation(locations[1].code);
      }
    }

    toast.success("Form has been reset");
  };

  // ── Success view ─────────────────────────────────────
  if (createdVehicle) {
    const v = createdVehicle.vehicle;
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Vehicle Added!
          </h2>
          <p className="text-gray-500 mb-6">
            {v.registrationNo} has been added to the waitlist
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {v.invoiceNo && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Invoice #</span>
                <span className="font-bold">{v.invoiceNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Registration</span>
              <span className="font-bold">{v.registrationNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Route</span>
              <span className="font-bold">
                {v.fromLocation} → {v.toLocation}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-sm font-bold text-gray-900">Total Amount</span>
              <div className="text-right">
                <span className="font-black text-[#296341]">${(300 + (v.nonRunning ? 75 : 0) + (300 + (v.nonRunning ? 75 : 0)) * 0.12).toFixed(2)}</span>
                <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Incl. 12% VAT</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 bg-[#296341] text-white py-3 rounded-xl font-bold hover:bg-[#1e4c30] transition-colors"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={vehicleImageRef}
        onChange={(e) => handleImageUpload(e, setVehicleImages, vehicleImages)}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={idImageRef}
        onChange={(e) => handleImageUpload(e, setIdImages, idImages)}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Standardized Hero Banner */}
      <DashboardBanner 
        imageSrc={imgIllustration.src} 
        alt="Vehicle Booking" 
        objectFit="contain"
        className="mb-6 md:mb-8"
      />

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16 md:pb-32 flex-1 w-full relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Form Details */}
          <div className="w-full lg:w-[65%] space-y-6 md:space-y-10">
            {/* Title Section */}
            <div className="mb-6 md:mb-10 text-center md:text-left">
              <h1 className="text-2xl md:text-[32px] font-bold text-black tracking-wide">
                <span className="border-b-4 border-black pb-1">VEHICLE</span>{" "}
                BOOKING
              </h1>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 md:space-y-8">
              {/* ── Voyage Picker ────────────────────── */}
              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-700 flex items-center gap-2">
                  <Ship className="w-5 h-5 text-[#296341]" /> Select Voyage
                </label>
                <div className="relative">
                  <select
                    value={selectedVoyageId}
                    onChange={(e) => handleVoyageSelect(e.target.value)}
                    disabled={isLoadingVoyages}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px]"
                  >
                    <option value="">
                      {isLoadingVoyages
                        ? "Loading voyages..."
                        : "— Select upcoming voyage —"}
                    </option>
                    {upcomingVoyages.map((v) => {
                      const dateStr = new Date(v.date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      );
                      const route =
                        v.stops && v.stops.length > 0
                          ? v.stops.map((s) => s.location.code).join(" → ")
                          : `${v.from?.code || "?"} → ${v.to?.code || "?"}`;
                      return (
                        <option key={v.id} value={v.id}>
                          Voyage #{v.voyageNo} — {dateStr} — {v.shipName} ({route})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                </div>
                {selectedVoyageId && (
                  <p className="text-sm text-[#296341] font-medium">
                    ✓ Voyage selected — From/To will be filtered to voyage
                    stops
                  </p>
                )}
              </div>

              {/* Make / Model Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">
                    Make
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Toyota"
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Corolla"
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
              </div>

              {/* License Plate / Type / Booking Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="BD 2394"
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700">
                    Vehicle Type *
                  </label>
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px]"
                    >
                      <option value="CAR">Car</option>
                      <option value="TRUCK">Truck</option>
                      <option value="SUV">SUV</option>
                      <option value="VAN">Van</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                      <option value="BOAT_TRAILER">Boat Trailer</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#296341]" /> Booking
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm focus:ring-2 focus:ring-[#296341] outline-none text-base md:text-[18px]"
                  />
                </div>
              </div>

              {/* From / To Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/20" />{" "}
                    From *
                  </label>
                  <div className="relative">
                    <select
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      disabled={isLoadingLocations}
                      className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px]"
                    >
                      {availableLocations.map((loc) => (
                        <option key={loc.id || loc.code} value={loc.code}>
                          {loc.code} — {loc.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-base md:text-[18px] font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="text-[#296341] w-5 h-5 fill-[#296341]/20" />{" "}
                    To *
                  </label>
                  <div className="relative">
                    <select
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      disabled={isLoadingLocations}
                      className="w-full h-12 md:h-[50px] bg-white border border-gray-200 rounded-md px-4 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#296341] text-base md:text-[18px]"
                    >
                      {availableLocations.map((loc) => (
                        <option key={loc.id || loc.code} value={loc.code}>
                          {loc.code} — {loc.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341]" />
                  </div>
                </div>
              </div>

              {/* Vehicle Photos */}
              <div className="space-y-2">
                <label className="text-base md:text-[18px] font-bold text-gray-700">
                  Vehicle Photos
                </label>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => vehicleImageRef.current?.click()}
                    className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-[#296341]/40 rounded-xl flex flex-col items-center justify-center gap-1 text-[#296341] hover:bg-[#296341]/5 transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                  <div className="flex gap-2 flex-wrap">
                    {vehicleImages.map((img) => (
                      <div
                        key={img.id}
                        className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 relative group"
                      >
                        <img
                          src={img.preview || img.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setVehicleImages(
                              vehicleImages.filter((i) => i.id !== img.id)
                            )
                          }
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Running Checkbox */}
            <div className="flex items-start sm:items-center gap-3 py-2">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${nonRunning
                    ? "border-[#296341] bg-[#296341]"
                    : "border-gray-300"
                  }`}
                onClick={() => setNonRunning(!nonRunning)}
              >
                {nonRunning && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-base md:text-[18px] font-medium leading-tight">
                Non-Running Vehicle{" "}
                <span className="text-gray-500 font-normal ml-0 sm:ml-2 block sm:inline">
                  (+$75 Fee)
                </span>
              </span>
            </div>

            {/* Comments Box */}
            <div className="bg-[#f0f0f0] rounded-xl p-4 shadow-inner">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comments / Details about the vehicle..."
                className="w-full bg-transparent border-none outline-none text-base md:text-[18px] text-gray-700 min-h-[80px] md:min-h-[100px] resize-none"
              />
            </div>

            {/* Contact Details Section */}
            <div className="space-y-6 pt-6">
              <h2 className="text-xl md:text-[22px] font-bold border-b border-gray-100 pb-2">
                Contact Details
              </h2>
              <div className="space-y-4 max-w-full sm:max-w-[500px]">
                {[
                  { label: "Name *", value: contactName, setter: setContactName },
                  { label: "Email", value: contactEmail, setter: setContactEmail },
                  {
                    label: "Phone",
                    value: contactPhone,
                    setter: setContactPhone,
                  },
                ].map((field, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8"
                  >
                    <label className="sm:w-20 font-bold text-gray-600 text-sm md:text-base">
                      {field.label}
                    </label>
                    <input
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="flex-1 h-10 md:h-[45px] bg-[#f9fafb] border border-gray-100 rounded-md px-4 shadow-sm outline-none focus:ring-2 focus:ring-[#296341] text-sm md:text-base font-bold"
                    />
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
                  <label className="sm:w-20 font-bold text-gray-600 text-sm md:text-base whitespace-nowrap">
                    ID Type :
                  </label>
                  <div className="relative flex-1">
                    <select
                      value={idType}
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

            {/* ID Photos */}
            <div className="space-y-2 pt-4">
              <label className="text-base md:text-[18px] font-bold text-gray-700">
                ID Documents
              </label>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => idImageRef.current?.click()}
                  className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-[#296341]/40 rounded-xl flex flex-col items-center justify-center gap-1 text-[#296341] hover:bg-[#296341]/5 transition-colors"
                >
                  <Paperclip className="w-6 h-6" />
                  <span className="text-[10px] font-bold">Add</span>
                </button>
                <div className="flex gap-2 flex-wrap">
                  {idImages.map((img) => (
                    <div
                      key={img.id}
                      className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 relative group"
                    >
                      <img
                        src={img.preview || img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setIdImages(
                            idImages.filter((i) => i.id !== img.id)
                          )
                        }
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="w-full lg:w-[35%] mt-12 lg:mt-24">
            <div className="bg-[#c2dccf] rounded-[24px] md:rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-[#296341]/20 relative">
              {/* Voyage info */}
              {selectedVoyageId && (
                <div className="mb-6 pb-4 border-b border-[#244234]/10">
                  <h3 className="text-sm font-bold text-gray-600 uppercase mb-1">
                    Assigned Voyage
                  </h3>
                  {(() => {
                    const v = upcomingVoyages.find(
                      (v) => v.id === selectedVoyageId
                    );
                    if (!v) return null;
                    return (
                      <p className="text-lg font-black text-[#132540]">
                        Voyage #{v.voyageNo} — {v.shipName}
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Total Amount Grid */}
              <div className="space-y-8 pb-32">
                <h3 className="text-center font-bold text-base md:text-[18px] tracking-widest">
                  TOTAL AMOUNT
                </h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase">
                      Vehicle Type
                    </p>
                    <p className="text-base md:text-[18px] font-bold">{vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase">
                      Licence Plate
                    </p>
                    <p className="text-base md:text-[18px] font-bold">
                      {licensePlate || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase">
                      Location
                    </p>
                    <p className="text-base md:text-[18px] font-bold flex items-center gap-1">
                      {fromLocation || "—"}{" "}
                      <ArrowRight className="w-3 h-3" />{" "}
                      {toLocation || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-[12px] font-bold text-gray-500 uppercase">
                      Booking Date
                    </p>
                    <p className="text-base md:text-[18px] font-bold">
                      {bookingDate || "—"}
                    </p>
                  </div>
                  {nonRunning && (
                    <div className="col-span-2">
                      <p className="text-[10px] md:text-[12px] font-bold text-amber-600 uppercase">
                        Non-Running Fee
                      </p>
                      <p className="text-base md:text-[18px] font-bold text-amber-700">
                        +$75.00
                      </p>
                    </div>
                  )}
                </div>

                {/* Paid / Unpaid Toggle */}
                <div className="flex gap-2 bg-gray-200/50 p-1 rounded-full border border-white/40">
                  <button
                    onClick={() => setPaymentStatus("PAID")}
                    className={`flex-1 py-2 rounded-full font-bold text-sm flex items-center justify-center gap-1 shadow-sm transition-all ${paymentStatus === "PAID"
                        ? "bg-[#2ecc71] text-white"
                        : "text-gray-400"
                      }`}
                  >
                    PAID
                  </button>
                  <button
                    onClick={() => setPaymentStatus("UNPAID")}
                    className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${paymentStatus === "UNPAID"
                        ? "bg-white text-gray-800"
                        : "text-gray-400"
                      }`}
                  >
                    UNPAID
                  </button>
                </div>

                <input
                  placeholder="Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full h-10 md:h-[40px] bg-gray-100/50 rounded-lg px-4 shadow-inner outline-none text-xs md:text-sm font-['Inter'] font-bold"
                />
              </div>

              {/* Total Card */}
              <div className="static md:absolute md:left-[10%] md:right-[10%] md:-bottom-20 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col items-center mt-8 md:mt-0">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Total Amount
                </p>
                <p className="text-4xl md:text-5xl font-black text-[#132540] tracking-tight leading-tight">
                  ${total.toFixed(2)}
                </p>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-center">
                    VAT SURCHARGE (12%) INCLUDED
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 bg-gray-50 px-6 py-2 rounded-full border border-gray-200/50">
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#296341]" /> 
                      Sub: ${subtotal.toFixed(2)}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 
                      Tax: ${vatAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 md:mt-24">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#132540] py-4 md:py-5 rounded-xl md:rounded-2xl text-white text-lg md:text-[24px] font-black tracking-widest hover:bg-[#1a3254] transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> SUBMITTING...
                  </>
                ) : (
                  "SUBMIT"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 md:py-10 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <img
              src={imgLogo.src}
              alt="Dean's Shipping Ltd."
              className="h-12 md:h-[70px]"
            />
          </div>
          <div className="text-white text-xl md:text-[28px] font-semibold text-center">
            Freight Agent |{" "}
            <span className="font-normal">
              {user
                ? `${user.firstName} ${user.lastName}`
                : "Staff Member"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function VehicleBooking() {
  return <VehicleBookingContent />;
}
