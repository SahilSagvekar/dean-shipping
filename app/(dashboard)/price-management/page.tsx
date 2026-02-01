"use client";

import { useState } from "react";
import { Trash2, Edit2, Menu } from "lucide-react";
import svgPaths from "../../imports/svg-84cwhtcp7h";
import imgDesk from "@/app/assets/ab576223d2665babdbfbcf0c2c488ca622b1efd4.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

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

export default function PriceManagement() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("DRY_BOX");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="bg-white min-h-screen">
      {/* Header with Hamburger Menu */}
      <header className="relative h-[200px]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute left-[94px] top-[50px] w-[95px] h-[95px] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <svg className="w-full h-full" fill="none" viewBox="0 0 95 95">
            <path d={svgPaths.pdb84a00} fill="#296341" />
          </svg>
        </button>

        {/* Illustration */}
        <div className="absolute left-[353px] top-[-132px] w-[716px] h-[716px]">
          <img
            src={imgDesk}
            alt="Admin illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Title */}
      <div className="max-w-[1440px] mx-auto px-[120px]">
        <h1 className="font-['Inter'] font-medium text-[40px] text-black mb-2">
          PRICE MANAGEMENT
        </h1>
        <div className="w-[202px] h-[5px] rounded-full bg-black mb-12" />

        {/* Category Buttons Grid */}
        <div className="grid grid-cols-3 gap-x-[150px] gap-y-4 mb-12 max-w-[1204px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as Category)}
              className={`h-[50px] rounded-[5px] font-['Inter'] font-medium text-[30px] transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#296341] text-white shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)]"
                  : "bg-white text-[#296341] shadow-[0px_3px_4px_0px_rgba(0,0,0,0.25)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* DRY BOX Section */}
        {selectedCategory === "DRY_BOX" && (
          <div className="bg-[#c2d9d1] shadow-[0px_4px_4px_0px_#296341] px-[119px] py-12 mb-12 -mx-[120px]">
            <div className="max-w-[1205px]">
              {/* Section Header */}
              <div className="bg-[#296341] h-[57px] rounded-[10px] shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center mb-12">
                <h2 className="font-['Inter'] font-medium text-[30px] text-white">
                  DRY BOX
                </h2>
              </div>

              {/* Input Fields Row 1 */}
              <div className="grid grid-cols-2 gap-[150px] mb-8">
                {/* Size */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                    Size
                  </label>
                  <input
                    type="text"
                    value={dryBoxSize}
                    onChange={(e) => setDryBoxSize(e.target.value)}
                    className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                    Location
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <select
                        value={dryBoxFrom}
                        onChange={(e) => setDryBoxFrom(e.target.value)}
                        className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-[23px] h-[41px] -rotate-90" fill="none" viewBox="0 0 22.5908 40.5312">
                          <path d={svgPaths.p640e000} fill="#296341" />
                        </svg>
                      </div>
                    </div>

                    <span className="font-['Inter'] font-medium text-[30px] text-black">
                      ---&gt;
                    </span>

                    <div className="relative flex-1">
                      <select
                        value={dryBoxTo}
                        onChange={(e) => setDryBoxTo(e.target.value)}
                        className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-[23px] h-[41px] -rotate-90" fill="none" viewBox="0 0 22.5908 40.5312">
                          <path d={svgPaths.p640e000} fill="#296341" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Fields Row 2 */}
              <div className="flex items-end gap-[150px] mb-12">
                {/* Value */}
                <div className="flex-1">
                  <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                    Value
                  </label>
                  <input
                    type="text"
                    value={dryBoxValue}
                    onChange={(e) => setDryBoxValue(e.target.value)}
                    className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>

                {/* ADD Button */}
                <div className="flex-1 flex justify-start">
                  <button
                    onClick={handleAddDryBox}
                    className="bg-[#132540] border border-black h-[49px] w-[166px] rounded-full font-['Inter'] font-semibold text-[26px] text-white hover:bg-[#0d1a2d] transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="space-y-4">
                {dryBoxPrices.slice(0, 5).map((price) => (
                  <div
                    key={price.id}
                    className="bg-white border border-[#296341] h-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center px-6"
                  >
                    <div className="font-['Inter'] font-semibold text-[26px] text-black w-[275px]">
                      {price.size}
                    </div>
                    <div className="font-['Inter'] font-semibold text-[26px] text-black w-[275px]">
                      {price.value}
                    </div>
                    <div className="font-['Inter'] font-semibold text-[26px] text-black flex-1">
                      {price.from} ---&gt; {price.to}
                    </div>
                    <div className="flex gap-2">
                      <button className="w-[40px] h-[40px] hover:opacity-70 transition-opacity">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                          <path d={svgPaths.p265e7200} fill="black" />
                          <path d={svgPaths.p2dd0b00} fill="black" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDryBox(price.id)}
                        className="w-[40px] h-[40px] hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                          <path d={svgPaths.p3925c600} fill="black" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex gap-4 mt-6">
                <span className="font-['Inter'] font-normal text-[20px] text-[#2450e0]">
                  5 of 20
                </span>
                <button className="font-['Inter'] font-normal text-[20px] text-[#2450e0] hover:underline">
                  Load more...
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTAINER Section */}
        {selectedCategory === "CONTAINER" && (
          <div className="bg-[#c2d9d1] shadow-[0px_4px_4px_0px_#296341] px-[119px] py-12 mb-12 -mx-[120px]">
            <div className="max-w-[1205px]">
              {/* Section Header */}
              <div className="bg-[#296341] h-[57px] rounded-[10px] shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center mb-12">
                <h2 className="font-['Inter'] font-medium text-[30px] text-white">
                  CONTAINER
                </h2>
              </div>

              {/* Input Fields Row 1 */}
              <div className="grid grid-cols-2 gap-[150px] mb-8">
                {/* Size */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                    Size
                  </label>
                  <input
                    type="text"
                    value={containerSize}
                    onChange={(e) => setContainerSize(e.target.value)}
                    className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                    Location
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <select
                        value={containerFrom}
                        onChange={(e) => setContainerFrom(e.target.value)}
                        className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-[23px] h-[41px] -rotate-90" fill="none" viewBox="0 0 22.5908 40.5312">
                          <path d={svgPaths.p640e000} fill="#296341" />
                        </svg>
                      </div>
                    </div>

                    <span className="font-['Inter'] font-medium text-[30px] text-black">
                      ---&gt;
                    </span>

                    <div className="relative flex-1">
                      <select
                        value={containerTo}
                        onChange={(e) => setContainerTo(e.target.value)}
                        className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                      >
                        <option value="NAS">NAS</option>
                        <option value="GTC">GTC</option>
                        <option value="MH">MH</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-[23px] h-[41px] -rotate-90" fill="none" viewBox="0 0 22.5908 40.5312">
                          <path d={svgPaths.p640e000} fill="#296341" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Fields Row 2 */}
              <div className="grid grid-cols-2 gap-[150px] mb-12">
                {/* Type */}
                <div>
                  <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={containerType}
                      onChange={(e) => setContainerType(e.target.value)}
                      className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    >
                      <option value="DRY">DRY</option>
                      <option value="FROZEN">FROZEN</option>
                      <option value="COOLER">COOLER</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-[23px] h-[41px] -rotate-90" fill="none" viewBox="0 0 22.5908 40.5312">
                        <path d={svgPaths.p640e000} fill="#296341" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Value and ADD Button */}
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block font-['Inter'] font-medium text-[30px] text-black mb-4">
                      Value
                    </label>
                    <input
                      type="text"
                      value={containerValue}
                      onChange={(e) => setContainerValue(e.target.value)}
                      className="w-full h-[50px] bg-white border-none rounded-none px-4 font-['Inter'] font-normal text-[20px] text-black focus:outline-none focus:ring-2 focus:ring-[#296341]"
                    />
                  </div>

                  <button
                    onClick={handleAddContainer}
                    className="bg-[#132540] border border-black h-[49px] w-[166px] rounded-full font-['Inter'] font-semibold text-[26px] text-white hover:bg-[#0d1a2d] transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="space-y-4">
                {containerPrices.slice(0, 5).map((price) => (
                  <div
                    key={price.id}
                    className="bg-white border border-[#296341] h-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center px-6"
                  >
                    <div className="font-['Inter'] font-semibold text-[26px] text-black w-[187px]">
                      {price.size}
                    </div>
                    <div className="font-['Inter'] font-semibold text-[26px] text-black w-[187px]">
                      {price.type}
                    </div>
                    <div className="font-['Inter'] font-semibold text-[26px] text-black w-[220px]">
                      {price.value}
                    </div>
                    <div className="font-['Inter'] font-semibold text-[26px] text-black flex-1">
                      {price.from} ---&gt; {price.to}
                    </div>
                    <div className="flex gap-2">
                      <button className="w-[40px] h-[40px] hover:opacity-70 transition-opacity">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                          <path d={svgPaths.p265e7200} fill="black" />
                          <path d={svgPaths.p2dd0b00} fill="black" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteContainer(price.id)}
                        className="w-[40px] h-[40px] hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-full h-full" fill="none" viewBox="0 0 40 40">
                          <path d={svgPaths.p3925c600} fill="black" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex gap-4 mt-6">
                <span className="font-['Inter'] font-normal text-[20px] text-[#2450e0]">
                  5 of 20
                </span>
                <button className="font-['Inter'] font-normal text-[20px] text-[#2450e0] hover:underline">
                  Load more...
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other categories */}
        {selectedCategory !== "DRY_BOX" && selectedCategory !== "CONTAINER" && (
          <div className="bg-[#c2d9d1] shadow-[0px_4px_4px_0px_#296341] px-[119px] py-12 mb-12 -mx-[120px]">
            <div className="max-w-[1205px]">
              <div className="bg-[#296341] h-[57px] rounded-[10px] shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center mb-12">
                <h2 className="font-['Inter'] font-medium text-[30px] text-white">
                  {categories.find((c) => c.id === selectedCategory)?.label}
                </h2>
              </div>
              <p className="font-['Inter'] font-normal text-[24px] text-black text-center py-12">
                Price management for this category coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#296341] h-[174px] flex items-center justify-center gap-8 px-8">
        <div className="w-[397px] h-[94px]">
          <img
            src={imgLogo}
            alt="Dean's Shipping Ltd."
            className="w-full h-full object-cover"
          />
        </div>
        <div className="font-['Inter'] text-[40px] text-white">
          <span className="font-semibold">Administration  |  </span>
          <span className="font-normal">Cicily Dean</span>
        </div>
      </footer>
    </div>
  );
}
