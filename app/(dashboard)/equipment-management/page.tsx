"use client";

import { useState } from "react";

// Icons
// HamburgerIcon is now handled by (dashboard)/layout.tsx


function ChevronIcon({ direction = "down" }: { direction?: "up" | "down" }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`w-6 h-6 transition-transform ${direction === "up" ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#296341"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 3.33334C13.1 3.33334 7.5 8.93334 7.5 15.8333C7.5 25.4167 20 36.6667 20 36.6667C20 36.6667 32.5 25.4167 32.5 15.8333C32.5 8.93334 26.9 3.33334 20 3.33334ZM20 20.4167C17.2333 20.4167 15 18.1833 15 15.4167C15 12.65 17.2333 10.4167 20 10.4167C22.7667 10.4167 25 12.65 25 15.4167C25 18.1833 22.7667 20.4167 20 20.4167Z"
        fill="#296341"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <path
        d="M10 32.5C10 34.25 11.75 35.8333 13.3333 35.8333H26.6667C28.25 35.8333 30 34.25 30 32.5V11.6667H10V32.5ZM31.6667 6.66667H25.8333L24.1667 5H15.8333L14.1667 6.66667H8.33334V10H31.6667V6.66667Z"
        fill="#296341"
      />
    </svg>
  );
}

function ForkliftIcon() {
  return (
    <svg width="32" height="28" viewBox="0 0 60 52" fill="none">
      <path
        d="M55 40H50V15C50 13.5 49 12 47.5 11.5L35 7V3C35 1.5 33.5 0 32 0H22C20.5 0 19 1.5 19 3V7L6.5 11.5C5 12 4 13.5 4 15V40H0V45H4C4 48.5 7 52 10.5 52C14 52 17 49 17 45.5H37C37 49 40 52 43.5 52C47 52 50 49 50 45.5V45H55V40ZM10.5 47C9 47 8 46 8 44.5C8 43 9 42 10.5 42C12 42 13 43 13 44.5C13 46 12 47 10.5 47ZM43.5 47C42 47 41 46 41 44.5C41 43 42 42 43.5 42C45 42 46 43 46 44.5C46 46 45 47 43.5 47Z"
        fill="#296341"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 72 56" fill="none">
      <path
        d="M64 16H54V4C54 2 52 0 50 0H4C2 0 0 2 0 4V40C0 42 2 44 4 44H8C8 50 13 56 20 56C27 56 32 51 32 44H40C40 50 45 56 52 56C59 56 64 51 64 44H68C70 44 72 42 72 40V28L64 16ZM20 50C16 50 14 47 14 44C14 41 17 38 20 38C23 38 26 41 26 44C26 47 24 50 20 50ZM52 50C48 50 46 47 46 44C46 41 49 38 52 38C55 38 58 41 58 44C58 47 56 50 52 50ZM54 28V22H62L66 28H54Z"
        fill="#296341"
      />
    </svg>
  );
}

function ChassisIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 42 52" fill="none">
      <path
        d="M38 20H32V4C32 2 30 0 28 0H14C12 0 10 2 10 4V20H4C2 20 0 22 0 24V48C0 50 2 52 4 52H38C40 52 42 50 42 48V24C42 22 40 20 38 20ZM14 4H28V20H14V4ZM21 44C17 44 14 41 14 37C14 33 17 30 21 30C25 30 28 33 28 37C28 41 25 44 21 44Z"
        fill="#296341"
      />
    </svg>
  );
}

function ContainerIcon() {
  return (
    <svg width="32" height="28" viewBox="0 0 55 48" fill="none">
      <path
        d="M48.125 6.875H6.875C3.4375 6.875 0.6875 9.625 0.6875 13.0625V41.25C0.6875 44.6875 3.4375 47.4375 6.875 47.4375H48.125C51.5625 47.4375 54.3125 44.6875 54.3125 41.25V13.0625C54.3125 9.625 51.5625 6.875 48.125 6.875Z"
        fill="#296341"
      />
      <line x1="33" y1="13" x2="33" y2="41" stroke="white" strokeWidth="1.5" />
      <line x1="40" y1="16" x2="40" y2="38" stroke="white" strokeWidth="1.5" />
      <line x1="47" y1="19" x2="47" y2="35" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <path
        d="M20 25C22.7614 25 25 22.7614 25 20C25 17.2386 22.7614 15 20 15C17.2386 15 15 17.2386 15 20C15 22.7614 17.2386 25 20 25Z"
        stroke="#296341"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32.5 20C32.5 19.1667 32.4167 18.3333 32.25 17.5L36.25 14.5833C36.6667 14.25 36.75 13.6667 36.5 13.25L32.75 6.75C32.5 6.33333 31.9167 6.16667 31.5 6.33333L26.8333 8.25C25.5 7.25 24 6.5 22.4167 6L21.6667 1.08333C21.5833 0.583333 21.1667 0.25 20.6667 0.25H13.3333C12.8333 0.25 12.4167 0.583333 12.3333 1.08333L11.5833 6C10 6.5 8.5 7.25 7.16667 8.25L2.5 6.33333C2.08333 6.16667 1.5 6.33333 1.25 6.75L-2.5 13.25"
        stroke="#296341"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1.67 5"
      />
    </svg>
  );
}

// Badge component for count
function CountBadge({
  count,
  bgColor = "bg-[#e5f7f1]",
  borderColor = "border-[#296341]",
}: {
  count: number;
  bgColor?: string;
  borderColor?: string;
}) {
  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-full w-10 h-8 flex items-center justify-center`}
    >
      <span className="text-[#296341] font-medium text-sm">{count}</span>
    </div>
  );
}

// Equipment category row (expandable)
function EquipmentCategory({
  icon,
  name,
  count,
  bgColor,
  badgeBg,
  expanded = false,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  count: number;
  bgColor: string;
  badgeBg: string;
  expanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${bgColor} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div
        className="bg-white mx-2 my-3 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 flex justify-center">{icon}</div>
          <span className="text-[#296341] font-semibold text-lg md:text-xl">
            {name}
          </span>
          <CountBadge count={count} bgColor={badgeBg} />
        </div>
        <ChevronIcon direction={expanded ? "up" : "down"} />
      </div>

      {/* Expanded content */}
      {expanded && children && (
        <div className="px-2 pb-3 space-y-2">{children}</div>
      )}
    </div>
  );
}

// Equipment item row
function EquipmentItem({
  name,
  location,
  onDelete,
}: {
  name: string;
  location: string;
  onDelete?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between">
      <span className="font-semibold text-black text-base md:text-lg">{name}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <LocationIcon />
          <span className="text-black font-medium text-base">{location}</span>
        </div>
        <button onClick={onDelete} className="p-1 hover:opacity-70">
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}

// Dropdown select component
function SelectField({
  icon,
  value,
  options,
}: {
  icon?: React.ReactNode;
  value: string;
  options?: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="bg-[#e5ebf3] rounded-md px-3 py-2 flex items-center justify-between min-w-[120px] md:min-w-[140px]">
        <span className="text-black font-medium text-sm">{value}</span>
        <ChevronIcon />
      </div>
    </div>
  );
}

export default function EquipmentManagementList() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("chassis");

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="bg-white">
      {/* Header is now handled by (dashboard)/layout.tsx */}
      <header className="relative">
        {/* Header image */}
        <div className="flex justify-center pt-2 pb-4">
          <img
            src="/warehouse-logistics.png"
            alt="Warehouse Logistics"
            className="h-48 md:h-56 object-contain"
          />
        </div>
      </header>

      {/* Equipment List Section */}
      <section className="px-4 md:px-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-medium text-black">
            EQUIPMENT LIST
          </h1>
          <div className="w-40 h-1 bg-black rounded-full mt-1" />
        </div>

        {/* Equipment Categories */}
        <div className="space-y-4">
          {/* Forklift */}
          <EquipmentCategory
            icon={<ForkliftIcon />}
            name="FORKLIFT"
            count={5}
            bgColor="bg-[#c2d9d1]"
            badgeBg="bg-[#e5f7f1]"
            expanded={expandedCategory === "forklift"}
            onToggle={() => toggleCategory("forklift")}
          />

          {/* Mule / Tractor */}
          <EquipmentCategory
            icon={<TruckIcon />}
            name="MULE / TRACTOR"
            count={3}
            bgColor="bg-[rgba(228,153,166,0.7)]"
            badgeBg="bg-[#ffdfe7]"
            expanded={expandedCategory === "mule"}
            onToggle={() => toggleCategory("mule")}
          />

          {/* Chassis - Expanded */}
          <EquipmentCategory
            icon={<ChassisIcon />}
            name="CHASSIS"
            count={4}
            bgColor="bg-[rgba(120,151,255,0.7)]"
            badgeBg="bg-[#ebe2ff]"
            expanded={expandedCategory === "chassis"}
            onToggle={() => toggleCategory("chassis")}
          >
            <EquipmentItem name="CHASSIS #01" location="Nassau" />
            <EquipmentItem name="CHASSIS #02" location="ABACO" />
            <EquipmentItem name="CHASSIS #03" location="MAH" />
            <EquipmentItem name="CHASSIS #04" location="Baker's Bay" />
          </EquipmentCategory>

          {/* Container */}
          <EquipmentCategory
            icon={<ContainerIcon />}
            name="CONTAINER"
            count={12}
            bgColor="bg-[rgba(199,190,144,0.7)]"
            badgeBg="bg-[#f7f4e5]"
            expanded={expandedCategory === "container"}
            onToggle={() => toggleCategory("container")}
          />

          {/* Flat Rack */}
          <EquipmentCategory
            icon={<ContainerIcon />}
            name="FLAT RACK"
            count={2}
            bgColor="bg-[#99d9e4]"
            badgeBg="bg-[#e5f7f5]"
            expanded={expandedCategory === "flatrack"}
            onToggle={() => toggleCategory("flatrack")}
          />
        </div>
      </section>

      {/* Add New Equipment Section */}
      <section className="bg-[#c2d9d1] mt-8 py-6 px-4 md:px-6">
        {/* Add New Equipment Button */}
        <div className="flex justify-center mb-4">
          <button className="bg-[#296341] text-white font-semibold px-6 py-3 rounded-2xl text-sm md:text-base">
            ADD NEW EQUIPMENT
          </button>
        </div>

        {/* Add Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <SelectField icon={<LocationIcon />} value="Nassau" />
            <SelectField icon={<SettingsIcon />} value="CONTAINER" />
            <SelectField icon={<ContainerIcon />} value="#10057" />
          </div>

          <div className="flex justify-center">
            <button className="bg-[#132540] text-white font-semibold px-8 py-2 rounded-full text-sm">
              ADD
            </button>
          </div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-8 bg-white" />
    </div>
  );
}