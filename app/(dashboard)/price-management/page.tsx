"use client";

import { useState } from "react";
import { Trash2, Edit2, ChevronDown, Plus, Search, ArrowRight } from "lucide-react";
import imgDesk from "@/app/assets/ab576223d2665babdbfbcf0c2c488ca622b1efd4.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// Import Sidebar pieces
import { SidebarProvider, Sidebar, HamburgerButton } from '@/components/sidebar';

type Category = "DRY_BOX" | "FROZEN_BOX" | "COOLER_BOX" | "ENVELOPE" | "CONTAINER" | "LUGGAGE" | "PALLET" | "VEHICLE" | "BUNDLE" | "PESSENGER";

interface DryBoxPrice {
  id: string;
  size: string;
  value: string;
  from: string;
  to: string;
}

interface ContainerPrice {
  id: string;
  size: string;
  type: string;
  value: string;
  from: string;
  to: string;
}

function PriceManagementContent() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("DRY_BOX");

  // Dry Box State
  const [dryBoxSize, setDryBoxSize] = useState("");
  const [dryBoxValue, setDryBoxValue] = useState("");
  const [dryBoxFrom, setDryBoxFrom] = useState("NAS");
  const [dryBoxTo, setDryBoxTo] = useState("GTC");
  const [dryBoxPrices, setDryBoxPrices] = useState<DryBoxPrice[]>([
    { id: "1", size: "05 ft", value: "100$", from: "NAS", to: "GTC" },
    { id: "2", size: "05 ft", value: "100$", from: "NAS", to: "MH" },
    { id: "3", size: "08 ft", value: "100$", from: "NAS", to: "GTC" },
    { id: "4", size: "08 ft", value: "100$", from: "NAS", to: "GTC" },
    { id: "5", size: "10 ft", value: "100$", from: "MH", to: "NAS" },
  ]);

  // Container State
  const [containerSize, setContainerSize] = useState("");
  const [containerType, setContainerType] = useState("DRY");
  const [containerValue, setContainerValue] = useState("");
  const [containerFrom, setContainerFrom] = useState("NAS");
  const [containerTo, setContainerTo] = useState("GTC");
  const [containerPrices, setContainerPrices] = useState<ContainerPrice[]>([
    { id: "1", size: "20 ft", type: "DRY", value: "1000$", from: "NAS", to: "GTC" },
    { id: "2", size: "40 ft", type: "DRY", value: "1000$", from: "NAS", to: "GTC" },
    { id: "3", size: "20 ft", type: "FROZEN", value: "1500$", from: "NAS", to: "GTC" },
    { id: "4", size: "40 ft", type: "FROZEN", value: "1500$", from: "NAS", to: "GTC" },
    { id: "5", size: "20 ft", type: "DRY", value: "1200$", from: "MH", to: "GTC" },
  ]);

  const handleAddDryBox = () => {
    if (dryBoxSize && dryBoxValue) {
      const newPrice: DryBoxPrice = {
        id: Date.now().toString(),
        size: dryBoxSize,
        value: dryBoxValue,
        from: dryBoxFrom,
        to: dryBoxTo,
      };
      setDryBoxPrices([...dryBoxPrices, newPrice]);
      setDryBoxSize("");
      setDryBoxValue("");
    }
  };

  const handleAddContainer = () => {
    if (containerSize && containerValue) {
      const newPrice: ContainerPrice = {
        id: Date.now().toString(),
        size: containerSize,
        type: containerType,
        value: containerValue,
        from: containerFrom,
        to: containerTo,
      };
      setContainerPrices([...containerPrices, newPrice]);
      setContainerSize("");
      setContainerValue("");
    }
  };

  const handleDeleteDryBox = (id: string) => {
    setDryBoxPrices(dryBoxPrices.filter((p) => p.id !== id));
  };

  const handleDeleteContainer = (id: string) => {
    setContainerPrices(containerPrices.filter((p) => p.id !== id));
  };

  const categories = [
    { id: "DRY_BOX", label: "DRY BOX" },
    { id: "FROZEN_BOX", label: "FROZEN BOX" },
    { id: "COOLER_BOX", label: "COOLER BOX" },
    { id: "ENVELOPE", label: "ENVELOPE" },
    { id: "CONTAINER", label: "CONTAINER" },
    { id: "LUGGAGE", label: "LUGGAGE" },
    { id: "PALLET", label: "PALLET" },
    { id: "VEHICLE", label: "VEHICLE" },
    { id: "BUNDLE", label: "BUNDLE" },
    { id: "PESSENGER", label: "PESSENGER" },
  ] as const;

  return (
    <div className="bg-white min-h-screen flex flex-col pt-[80px]">
      {/* Sidebar Drop-in */}
      <Sidebar logoSrc={imgLogo.src} />

      {/* Header with Hamburger */}
      <div className="px-8 py-4">
        <HamburgerButton iconSize={48} />
      </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as Category)}
              className={`py-3 rounded-[8px] text-[22px] font-semibold border-2 transition-all shadow-sm ${selectedCategory === cat.id
                  ? "bg-[#296341] text-white border-[#296341]"
                  : "bg-white text-[#296341] border-gray-100 hover:border-[#296341]/30"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Category Section */}
        <div className="bg-[#c2dcd1] rounded-2xl p-10 shadow-lg mb-12 border-b-4 border-[#296341]">
          {/* Section Header */}
          <div className="bg-[#296341] py-3 rounded-lg text-center mb-10 shadow-md">
            <h2 className="text-[28px] font-bold text-white tracking-widest uppercase">
              {categories.find(c => c.id === selectedCategory)?.label}
            </h2>
          </div>

          {/* Form Content based on category */}
          {selectedCategory === "DRY_BOX" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[24px] font-bold mb-3">Size</label>
                  <input
                    type="text"
                    value={dryBoxSize}
                    onChange={(e) => setDryBoxSize(e.target.value)}
                    className="w-full h-[54px] bg-white rounded-md border-none px-6 text-[20px] shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div>
                  <label className="block text-[24px] font-bold mb-3">Location</label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <select
                        value={dryBoxFrom}
                        onChange={(e) => setDryBoxFrom(e.target.value)}
                        className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                    </div>
                    <ArrowRight className="w-8 h-8 text-gray-700" />
                    <div className="relative flex-1">
                      <select
                        value={dryBoxTo}
                        onChange={(e) => setDryBoxTo(e.target.value)}
                        className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-12">
                <div className="flex-1">
                  <label className="block text-[24px] font-bold mb-3">Value</label>
                  <input
                    type="text"
                    value={dryBoxValue}
                    onChange={(e) => setDryBoxValue(e.target.value)}
                    className="w-full h-[54px] bg-white rounded-md border-none px-6 text-[20px] shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <button
                  onClick={handleAddDryBox}
                  className="bg-[#132540] text-white px-12 py-3 rounded-md text-[24px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95"
                >
                  ADD
                </button>
              </div>

              {/* Data Table */}
              <div className="space-y-4">
                {dryBoxPrices.map((price) => (
                  <div key={price.id} className="bg-white rounded-md border border-[#296341]/30 p-2 flex items-center shadow-sm group">
                    <div className="w-[150px] font-bold text-[22px] px-4 border-r border-gray-100">{price.size}</div>
                    <div className="w-[150px] font-bold text-[22px] px-4 border-r border-gray-100">{price.value}</div>
                    <div className="flex-1 font-bold text-[22px] px-4 flex items-center gap-4">
                      {price.from} <ArrowRight className="w-5 h-5 opacity-40" /> {price.to}
                    </div>
                    <div className="flex gap-2 px-4">
                      <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <Edit2 className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteDryBox(price.id)}
                        className="p-2 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-[#296341] group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex items-center gap-4">
                <span className="text-blue-600 text-[18px]">5 of 20</span>
                <button className="text-blue-600 text-[18px] hover:underline font-medium">Load more...</button>
              </div>
            </div>
          )}

          {selectedCategory === "CONTAINER" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[24px] font-bold mb-3">Size</label>
                  <input
                    type="text"
                    value={containerSize}
                    onChange={(e) => setContainerSize(e.target.value)}
                    className="w-full h-[54px] bg-white rounded-md border-none px-6 text-[20px] shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
                <div>
                  <label className="block text-[24px] font-bold mb-3">Location</label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <select
                        value={containerFrom}
                        onChange={(e) => setContainerFrom(e.target.value)}
                        className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                    </div>
                    <ArrowRight className="w-8 h-8 text-gray-700" />
                    <div className="relative flex-1">
                      <select
                        value={containerTo}
                        onChange={(e) => setContainerTo(e.target.value)}
                        className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="block text-[24px] font-bold mb-3">Type</label>
                  <div className="relative">
                    <select
                      value={containerType}
                      onChange={(e) => setContainerType(e.target.value)}
                      className="w-full h-[54px] bg-white rounded-md appearance-none px-6 text-[20px] shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="DRY">DRY</option>
                      <option value="FROZEN">FROZEN</option>
                      <option value="COOLER">COOLER</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#296341] pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-end gap-6">
                  <div className="flex-1">
                    <label className="block text-[24px] font-bold mb-3">Value</label>
                    <input
                      type="text"
                      value={containerValue}
                      onChange={(e) => setContainerValue(e.target.value)}
                      className="w-full h-[54px] bg-white rounded-md border-none px-6 text-[20px] shadow-sm outline-none focus:ring-2 focus:ring-[#296341]"
                    />
                  </div>
                  <button
                    onClick={handleAddContainer}
                    className="bg-[#132540] text-white px-12 py-3 rounded-md text-[24px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="space-y-4">
                {containerPrices.map((price) => (
                  <div key={price.id} className="bg-white rounded-md border border-[#296341]/30 p-2 flex items-center shadow-sm group">
                    <div className="w-[120px] font-bold text-[22px] px-4 border-r border-gray-100">{price.size}</div>
                    <div className="w-[120px] font-bold text-[22px] px-4 border-r border-gray-100">{price.type}</div>
                    <div className="w-[150px] font-bold text-[22px] px-4 border-r border-gray-100">{price.value}</div>
                    <div className="flex-1 font-bold text-[22px] px-4 flex items-center gap-4 text-center">
                      {price.from} <ArrowRight className="w-5 h-5 opacity-40" /> {price.to}
                    </div>
                    <div className="flex gap-2 px-4">
                      <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <Edit2 className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteContainer(price.id)}
                        className="p-2 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-[#296341] group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex items-center gap-4">
                <span className="text-blue-600 text-[18px]">5 of 20</span>
                <button className="text-blue-600 text-[18px] hover:underline font-medium">Load more...</button>
              </div>
            </div>
          )}

          {/* Placeholder for others */}
          {selectedCategory !== "DRY_BOX" && selectedCategory !== "CONTAINER" && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Plus className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-[24px] font-medium tracking-wide">Category Management Coming Soon</p>
            </div>
          )}
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[70px]" />
          </div>
          <div className="text-white text-[28px] font-semibold">
            Administration | <span className="font-normal">Cicily Dean</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PriceManagement() {
  return (
    <SidebarProvider>
      <PriceManagementContent />
    </SidebarProvider>
  );
}
