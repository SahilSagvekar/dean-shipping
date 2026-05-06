"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Camera,
  FileText,
  Loader2,
  Check,
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  User,
  Building,
  Phone,
  Hash,
  Anchor
} from "lucide-react";
import imgPngClipartOccupationalSafetyRemovebgPreview1 from "@/app/assets/b44f74b3456b5fbbf83fdac0d10a96c2051e7d69.png";
import  DashboardBanner from "@/components/ui/DashboardBanner";

export default function IncidentReport() {
  const { apiFetch, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    incidentType: "Cargo Damaged",
    description: "",
    location: "",
    invoiceNo: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    insuranceTaken: false,
    shipmentDetails: "",
    severity: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  });

  const [images, setImages] = useState<string[]>([]);

  // Pre-fill user details
  const name = user ? `${user.firstName} ${user.lastName}` : "Loading...";
  const department = user?.designation || "Freight Supervisor";
  const mobileNumber = user?.mobileNumber || "N/A";

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("imageType", "incident");

      try {
        const res = await apiFetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("An error occurred during upload.");
      }
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.description) {
      toast.error("Please provide an incident description.");
      return;
    }
    if (!formData.location) {
      toast.error("Please specify at least the incident location.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        title: formData.title || `Incident: ${formData.incidentType} - ${formData.location}`,
        images,
      };

      const res = await apiFetch("/api/incidents", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Incident report submitted successfully!");
        // Reset form
        setFormData({
          title: "",
          incidentType: "Cargo Damaged",
          description: "",
          location: "",
          invoiceNo: "",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          insuranceTaken: false,
          shipmentDetails: "",
          severity: "MEDIUM",
        });
        setImages([]);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit report.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred while submitting.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Standardized Hero Banner */}
      <DashboardBanner 
        imageSrc={imgPngClipartOccupationalSafetyRemovebgPreview1.src} 
        alt="Safety" 
        objectFit="contain"
        className="bg-white pt-8 pb-4 mb-0"
      />

      <div className="max-w-5xl mx-auto px-6">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2 uppercase">
            Incident Report
          </h1>
          <div className="h-1.5 w-48 bg-black rounded-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Reporter Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
            <div className="relative">
              <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <User className="size-4 text-[#296341]" /> Reported By
              </label>
              <div className="w-full bg-white border border-[#296341]/30 rounded-lg px-4 py-3 text-xl font-medium text-gray-800 shadow-sm">
                {name}
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <Building className="size-4 text-[#296341]" /> Department
              </label>
              <div className="w-full bg-white border border-[#296341]/30 rounded-lg px-4 py-3 text-xl font-medium text-gray-800 shadow-sm">
                {department}
              </div>
            </div>

            <div className="relative md:col-span-2">
              <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <Phone className="size-4 text-[#296341]" /> Contact Phone
              </label>
              <div className="max-w-md w-full bg-white border border-[#296341]/30 rounded-lg px-4 py-3 text-xl font-medium text-gray-800 shadow-sm">
                {mobileNumber}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Incident Type Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
              Description of Incident
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Container Damaged", "Cargo Damaged", "Other"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange("incidentType", type)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${formData.incidentType === type
                      ? "bg-[#296341] border-[#296341] text-white shadow-lg scale-[1.02]"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#296341]/40"
                    }`}
                >
                  <div className={`size-6 rounded-full border-2 flex items-center justify-center ${formData.incidentType === type ? "border-white" : "border-gray-300"
                    }`}>
                    {formData.incidentType === type && <div className="size-3 bg-white rounded-full" />}
                  </div>
                  <span className="text-lg font-bold">{type}</span>
                </button>
              ))}
            </div>

            {formData.incidentType === "Other" && (
              <input
                type="text"
                placeholder="Please specify incident title..."
                className="w-full border-b-2 border-gray-100 py-2 text-xl focus:border-[#296341] outline-none transition-colors"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            )}
          </div>

          {/* Section 3: Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                  <MapPin className="size-4 text-[#296341]" /> Location
                </label>
                <input
                  type="text"
                  placeholder="Where did it happen?"
                  className="w-full bg-white border border-[#296341]/40 rounded-lg px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:ring-[#296341]/20 outline-none"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                    <Calendar className="size-4 text-[#296341]" /> Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border border-[#296341]/40 rounded-lg px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:ring-[#296341]/20 outline-none"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                    <Clock className="size-4 text-[#296341]" /> Time
                  </label>
                  <input
                    type="time"
                    className="w-full bg-white border border-[#296341]/40 rounded-lg px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:ring-[#296341]/20 outline-none"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck className="size-4 text-[#296341]" /> Insurance Taken
                </label>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={val ? "yes" : "no"}
                      type="button"
                      onClick={() => handleInputChange("insuranceTaken", val)}
                      className={`flex-1 py-3 px-6 rounded-lg border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${formData.insuranceTaken === val
                          ? "bg-[#296341] border-[#296341] text-white"
                          : "bg-white border-gray-100 text-gray-400"
                        }`}
                    >
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center ${formData.insuranceTaken === val ? "border-white" : "border-gray-200"
                        }`}>
                        {formData.insuranceTaken === val && <div className="size-2.5 bg-white rounded-full" />}
                      </div>
                      {val ? "YES" : "NO"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                  <Hash className="size-4 text-[#296341]" /> Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="#DSL-..."
                  className="w-full bg-white border border-[#296341]/40 rounded-lg px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:ring-[#296341]/20 outline-none"
                  value={formData.invoiceNo}
                  onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Descripton Textareas */}
            <div className="space-y-6">
              <div className="h-full flex flex-col">
                <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                  <FileText className="size-4 text-[#296341]" /> Incident Details
                </label>
                <textarea
                  placeholder="How the incident happened, factors leading to the event, and what took place. Be as specific as possible."
                  className="flex-1 w-full bg-white border border-[#296341]/40 rounded-lg px-4 py-3 text-lg font-medium shadow-sm min-h-[300px] focus:ring-2 focus:ring-[#296341]/20 outline-none resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4: Shipment Details */}
          <div>
            <label className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
              Shipment Details (Items, IDs, etc)
            </label>
            <textarea
              placeholder="List the shipments affected or add any secondary details here..."
              className="w-full bg-white border border-[#296341]/40 rounded-lg px-4 py-3 text-lg font-medium shadow-sm min-h-[100px] focus:ring-2 focus:ring-[#296341]/20 outline-none"
              value={formData.shipmentDetails}
              onChange={(e) => handleInputChange("shipmentDetails", e.target.value)}
            />
          </div>

          {/* Section 5: Image Uploads */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2">
              <Camera className="size-6 text-[#296341]" /> Media Upload
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {/* Main Large Slot (Input) */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="col-span-1 min-h-[140px] border-2 border-dashed border-[#296341]/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                {isUploading ? (
                  <Loader2 className="size-8 text-[#296341] animate-spin" />
                ) : (
                  <>
                    <Camera className="size-8 text-[#296341] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-[#296341]">ADD PHOTO</span>
                  </>
                )}
              </div>

              {/* Display Uploaded Images */}
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-md group">
                  <img src={url} alt={`Upload ${idx}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow hover:bg-white text-red-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#132540] text-white px-20 py-4 rounded-xl text-2xl font-bold shadow-xl hover:bg-[#1a3254] transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isLoading ? <Loader2 className="size-7 animate-spin" /> : "SUBMIT REPORT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
