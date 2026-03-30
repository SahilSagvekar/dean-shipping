"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, ChevronDown, Plus, Loader2, ArrowRight, X, Package, Snowflake, Thermometer, Mail, Container, Briefcase, LayoutGrid, Car, Layers, Users } from "lucide-react";
import imgDesk from "@/app/assets/ab576223d2665babdbfbcf0c2c488ca622b1efd4.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import { useAuth } from "@/lib/auth-context";

// Types
type Category = "DRY_BOX" | "FROZEN_BOX" | "COOLER_BOX" | "ENVELOPE" | "CONTAINER" | "LUGGAGE" | "PALLET" | "VEHICLE" | "BUNDLE" | "PASSENGER";
type ContainerType = "DRY" | "FROZEN" | "COOLER";

interface Price {
  id: string;
  category: Category;
  size: string;
  type: ContainerType | null;
  value: number;
  from: { code: string; name: string };
  to: { code: string; name: string };
}

interface Location {
  id: string;
  code: string;
  name: string;
}

function PriceManagementContent() {
  const { user, apiFetch } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category>("DRY_BOX");

  // Data State
  const [prices, setPrices] = useState<Price[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  // Form State
  const [formSize, setFormSize] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formFrom, setFormFrom] = useState("NAS");
  const [formTo, setFormTo] = useState("GTC");
  const [formType, setFormType] = useState<ContainerType>("DRY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = [
    { id: "DRY_BOX", label: "DRY BOX", icon: Package },
    { id: "FROZEN_BOX", label: "FROZEN BOX", icon: Snowflake },
    { id: "COOLER_BOX", label: "COOLER BOX", icon: Thermometer },
    { id: "ENVELOPE", label: "ENVELOPE", icon: Mail },
    { id: "CONTAINER", label: "CONTAINER", icon: Container },
    { id: "LUGGAGE", label: "LUGGAGE", icon: Briefcase },
    { id: "PALLET", label: "PALLET", icon: LayoutGrid },
    { id: "VEHICLE", label: "VEHICLE", icon: Car },
    { id: "BUNDLE", label: "BUNDLE", icon: Layers },
    { id: "PASSENGER", label: "PASSENGER", icon: Users },
  ] as const;

  // Check if category needs type field
  const needsType = (cat: Category) => cat === "CONTAINER";

  // Fetch locations on mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await apiFetch("/api/locations");
        const data = await res.json();
        if (data.locations) {
          setLocations(data.locations);
          if (data.locations.length > 0) {
            setFormFrom(data.locations[0].code);
            setFormTo(data.locations[1]?.code || data.locations[0].code);
          }
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    }
    fetchLocations();
  }, [apiFetch]);

  // Fetch prices when category or page changes
  const fetchPrices = async (page: number = 1) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/prices?category=${selectedCategory}&limit=5&page=${page}`);
      const data = await res.json();
      if (res.ok) {
        setPrices(data.prices || []);
        setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
      } else {
        setError(data.error || "Failed to fetch prices");
        setPrices([]);
      }
    } catch (err: any) {
      setError(err.message);
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(1);
  }, [selectedCategory, apiFetch]);

  // Handle Add
  const handleAdd = async () => {
    if (!formSize || !formValue) {
      setError("Please fill in size and value");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await apiFetch("/api/prices", {
        method: "POST",
        body: JSON.stringify({
          category: selectedCategory,
          size: formSize,
          value: parseFloat(formValue),
          fromCode: formFrom,
          toCode: formTo,
          ...(needsType(selectedCategory) ? { type: formType } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add price");
        return;
      }

      // Refresh list
      const refreshRes = await apiFetch(`/api/prices?category=${selectedCategory}&limit=5&page=1`);
      const refreshData = await refreshRes.json();
      setPrices(refreshData.prices || []);
      setPagination(refreshData.pagination);

      // Clear form
      setFormSize("");
      setFormValue("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit
  const handleEdit = (price: Price) => {
    setEditingId(price.id);
    setFormSize(price.size);
    setFormValue(price.value.toString());
    setFormFrom(price.from.code);
    setFormTo(price.to.code);
    if (price.type) setFormType(price.type);
  };

  // Handle Update
  const handleUpdate = async () => {
    if (!editingId || !formSize || !formValue) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await apiFetch(`/api/prices/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          size: formSize,
          value: parseFloat(formValue),
          fromCode: formFrom,
          toCode: formTo,
          ...(needsType(selectedCategory) ? { type: formType } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update price");
        return;
      }

      // Refresh list
      const refreshRes = await apiFetch(`/api/prices?category=${selectedCategory}&limit=5&page=${pagination.page}`);
      const refreshData = await refreshRes.json();
      setPrices(refreshData.prices || []);

      // Clear form
      setEditingId(null);
      setFormSize("");
      setFormValue("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this price?")) return;

    try {
      const res = await apiFetch(`/api/prices/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete price");
        return;
      }

      // Refresh list - go to previous page if current page becomes empty
      const currentPage = prices.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      fetchPrices(currentPage);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setFormSize("");
    setFormValue("");
  };

  // Page Navigation
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPrices(page);
  };

  // Location options
  const locationOptions = locations.length > 0
    ? locations.map(loc => ({ value: loc.code, label: loc.code }))
    : [{ value: "NAS", label: "NAS" }, { value: "GTC", label: "GTC" }, { value: "MHA", label: "MHA" }];

  return (
    <div className="bg-white">
      {/* Hero Illustration */}
      <div className="flex justify-center mb-12 px-8">
        <div className="relative w-full max-w-[800px] aspect-[800/500] overflow-hidden rounded-xl">
          <img
            src={imgDesk.src}
            alt="Price Management illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-12 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-[36px] font-bold text-black mb-1">PRICE MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[180px]" />
        </div>

        {/* Category Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-16">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as Category);
                  setEditingId(null);
                  setFormSize("");
                  setFormValue("");
                }}
                className={`py-4 px-3 rounded-[12px] text-[16px] font-semibold border-2 transition-all shadow-sm flex flex-col items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-[#296341] text-white border-[#296341]"
                    : "bg-white text-[#296341] border-gray-100 hover:border-[#296341]/30 hover:bg-[#296341]/5"
                }`}
              >
                <Icon className={`w-8 h-8 ${selectedCategory === cat.id ? "text-white" : "text-[#296341]"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Section */}
        <div className="bg-[#c2dcd1] rounded-2xl p-10 shadow-lg mb-12 border-b-4 border-[#296341]">
          {/* Section Header */}
          <div className="bg-[#296341] py-3 rounded-lg text-center mb-10 shadow-md">
            <h2 className="text-[28px] font-bold text-white tracking-widest uppercase">
              {categories.find(c => c.id === selectedCategory)?.label}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")}><X className="w-5 h-5" /></button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className="block text-[24px] font-bold mb-3">Size (ft)</label>
                <input
                  type="text"
                  value={formSize}
                  onChange={(e) => setFormSize(e.target.value)}
                  placeholder="e.g., Small, Medium, 20 ft"
                  className="w-full h-[54px] bg-white rounded-md border-none px-6 text-[20px] shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
              <div>
                <label className="block text-[24px] font-bold mb-3">Location</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <select
                      value={formFrom}
                      onChange={(e) => setFormFrom(e.target.value)}
                      className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                    >
                      {locationOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                  </div>
                  <ArrowRight className="w-8 h-8 text-gray-700" />
                  <div className="relative flex-1">
                    <select
                      value={formTo}
                      onChange={(e) => setFormTo(e.target.value)}
                      className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                    >
                      {locationOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Type dropdown for Container */}
            {needsType(selectedCategory) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[24px] font-bold mb-3">Type</label>
                  <div className="relative">
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as ContainerType)}
                      className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="DRY">DRY</option>
                      <option value="FROZEN">FROZEN</option>
                      <option value="COOLER">COOLER</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                  </div>
                </div>
                <div />
              </div>
            )}

            {/* Value and Add/Update Button */}
            <div className="flex items-end gap-12">
              <div className="flex-1">
                <label className="block text-[24px] font-bold mb-3">Value ($)</label>
                <input
                  type="number"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-[54px] bg-white rounded-md border-none px-6 text-[20px] shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>
              {editingId ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="bg-[#132540] text-white px-12 py-3 rounded-md text-[24px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-6 h-6 animate-spin" />}
                    UPDATE
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-400 text-white px-8 py-3 rounded-md text-[24px] font-bold hover:bg-gray-500 transition-all shadow-md active:scale-95"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={isSubmitting}
                  className="bg-[#132540] text-white px-12 py-3 rounded-md text-[24px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-6 h-6 animate-spin" />}
                  ADD
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && prices.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
              </div>
            ) : prices.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Plus className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-[24px] font-medium tracking-wide">No prices found</p>
                <p className="text-[16px] mt-2">Add your first price above</p>
              </div>
            ) : (
              <>
                {/* Data Table */}
                <div className="space-y-4">
                  {prices.map((price) => (
                    <div
                      key={price.id}
                      className={`bg-white rounded-md border p-2 flex items-center shadow-sm group ${
                        editingId === price.id ? "border-[#296341] border-2" : "border-[#296341]/30"
                      }`}
                    >
                      <div className="w-[150px] font-bold text-[22px] px-4 border-r border-gray-100">
                        {price.size}
                      </div>
                      {needsType(selectedCategory) && (
                        <div className="w-[120px] font-bold text-[22px] px-4 border-r border-gray-100">
                          {price.type || "-"}
                        </div>
                      )}
                      <div className="w-[150px] font-bold text-[22px] px-4 border-r border-gray-100">
                        ${price.value.toFixed(2)}
                      </div>
                      <div className="flex-1 font-bold text-[22px] px-4 flex items-center gap-4">
                        {price.from.code} <ArrowRight className="w-5 h-5 opacity-40" /> {price.to.code}
                      </div>
                      <div className="flex gap-2 px-4">
                        <button
                          onClick={() => handleEdit(price)}
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="p-2 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-[#296341] group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="pt-6 flex items-center justify-between">
                  <span className="text-gray-600 text-[18px]">
                    Showing {((pagination.page - 1) * 5) + 1} - {Math.min(pagination.page * 5, pagination.total)} of {pagination.total}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1 || isLoading}
                      className="px-4 py-2 rounded-md border border-[#296341] text-[#296341] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#296341] hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          disabled={isLoading}
                          className={`w-10 h-10 rounded-md font-bold text-[18px] transition-colors ${
                            pageNum === pagination.page
                              ? "bg-[#296341] text-white"
                              : "border border-gray-300 text-gray-600 hover:border-[#296341] hover:text-[#296341]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages || isLoading}
                      className="px-4 py-2 rounded-md border border-[#296341] text-[#296341] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#296341] hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
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
            {user?.role || "Administration"} | <span className="font-normal">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PriceManagement() {
  return <PriceManagementContent />;
}