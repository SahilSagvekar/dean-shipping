import Image from "next/image";
import image2 from "@/app/assets/cc1821c6ea8a81adb203fcf9b1bb2ee371bbcbed.png"

// Vehicle icon component
function VehicleIcon({ variant = "default" }: { variant?: "default" | "plus" | "list" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none" className="w-6 h-6">
      <path
        d="M5 45V25C5 23 6 21 8 20L15 15H45L52 20C54 21 55 23 55 25V45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 45V50H20V45M40 45V50H50V45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="8" y="30" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      {variant === "plus" && (
        <>
          <line x1="46" y1="8" x2="46" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="38" y1="16" x2="54" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {variant === "list" && (
        <path d="M38 12L50 12M38 18L50 18M38 24L46 24" stroke="currentColor" strokeWidth="1.6" />
      )}
    </svg>
  );
}

// Hamburger menu icon
// HamburgerIcon is now handled by (dashboard)/layout.tsx


// Arrow icon for accordion
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Delete icon
function DeleteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 66 66" fill="none">
      <path
        d="M16.5 55C16.5 57.75 18.7 60 21.5 60H44.5C47.3 60 49.5 57.75 49.5 55V20H16.5V55ZM52 12.5H43.25L40.75 10H25.25L22.75 12.5H14V17.5H52V12.5Z"
        fill="#132540"
      />
    </svg>
  );
}

// Input field component
function InputField({
  label,
  value,
  readonly = true,
}: {
  label: string;
  value: string;
  readonly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-black">{label}</label>
      <div className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 text-sm text-black">
        {value}
      </div>
    </div>
  );
}

// Waitlist card (collapsed view)
function WaitlistCard({
  name,
  invoiceNo,
  vehicleCount,
  expanded = false,
}: {
  name: string;
  invoiceNo: string;
  vehicleCount: number;
  expanded?: boolean;
}) {
  return (
    <div className="bg-[#e5f7f1] rounded-[10px] p-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <InputField label="Name" value={name} />
          <InputField label="Invoice No." value={invoiceNo} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">#Vehicle</label>
            <div className="text-xl font-medium text-black pt-2">{vehicleCount}</div>
          </div>
        </div>
        <button className="ml-4 p-2">
          <ChevronIcon direction={expanded ? "up" : "down"} />
        </button>
      </div>
    </div>
  );
}

export default function AgentVehicleDetails() {
  return (
    <div className="bg-white">
      {/* Header is now handled by (dashboard)/layout.tsx */}
      <header className="flex items-start justify-between p-4">
        <div className="flex-1 flex justify-center">
          <img
            src={image2.src}
            alt="Vehicle"
            className="h-40 object-contain"
          />
        </div>
      </header>

      {/* Action Buttons */}
      <div className="px-6 flex gap-4 mb-8">
        <button className="flex-1 bg-[#296341] text-white rounded-[10px] py-4 flex items-center justify-center gap-2 text-lg font-medium">
          <VehicleIcon variant="plus" />
          ADD VEHICLE
        </button>
        <button className="flex-1 bg-[#296341] text-white rounded-[10px] py-4 flex items-center justify-center gap-2 text-lg font-medium">
          <VehicleIcon variant="list" />
          VEHICLE WAITLIST
        </button>
      </div>

      {/* Add Vehicle Waitlist Section */}
      <section className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <VehicleIcon variant="plus" />
          <h2 className="text-xl font-medium text-black">ADD VEHICLE WAITLIST</h2>
        </div>
        <div className="w-48 h-1 bg-[#132540] rounded-full mb-4" />

        <div className="bg-[#e5f7f1] rounded-[10px] p-4 space-y-4">
          {/* Row 1: Name, Email, Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Name" value="Jhon Doe" />
            <InputField label="Email" value="jhondoe@demo.com" />
            <InputField label="Contact" value="+1 1234 5678" />
          </div>

          {/* Row 2: Invoice no, Date, License plate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Invoice no." value="#56724" />
            <InputField label="Date" value="12 / 12 / 2025" />
            <InputField label="License plate" value="BD 1234" />
          </div>

          {/* Row 3: Vehicle, From, To */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Vehicle" value="Honda Creta" />
            <InputField label="From" value="NAS" />
            <InputField label="To" value="MAH" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-black">Details</label>
            <div className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 min-h-[80px] text-sm text-black" />
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-2">
            <button className="bg-[#132540] text-white rounded-[10px] px-12 py-3 text-lg font-medium">
              Save
            </button>
          </div>
        </div>
      </section>

      {/* View Vehicle Waitlist Section */}
      <section className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <VehicleIcon variant="list" />
          <h2 className="text-xl font-medium text-black">VIEW VEHICLE WAITLIST</h2>
          <div className="ml-2 w-10 h-10 rounded-full bg-[#e4ebf4] border-2 border-[#132540] flex items-center justify-center">
            <span className="text-lg font-bold text-[#132540]">3</span>
          </div>
        </div>
        <div className="w-48 h-1 bg-[#132540] rounded-full mb-4" />

        {/* Expanded Waitlist Item */}
        <div className="bg-[#e5f7f1] rounded-[10px] p-4 mb-4 space-y-4">
          {/* Row 1: Name, Email, Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Name" value="Jhon Doe" />
            <InputField label="Email" value="jhondoe@demo.com" />
            <InputField label="Contact" value="+1 1234 5678" />
          </div>

          {/* Row 2: Invoice no, Date Added, License plate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Invoice no." value="#56724" />
            <InputField label="Date Added" value="12 / 12 / 2025" />
            <InputField label="License plate" value="BD 1234" />
          </div>

          {/* Vehicle Details Header */}
          <div>
            <h3 className="text-lg font-semibold text-[#296341]">VEHICLE DETAILS</h3>
            <div className="w-32 h-0.5 bg-black mt-1" />
          </div>

          {/* Vehicle Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-[#296341]">DETAILS</p>
              <p className="text-sm text-black">TO BE SHIP NEXT WEEK</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#296341]">VEHICLE</p>
              <p className="text-sm text-black">HUNDAI CRETA</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#296341]">DESTINATION</p>
              <p className="text-sm text-black">MARSH HARBOUR</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-semibold text-[#296341] mb-1">STATUS</p>
            <div className="bg-white rounded-[5px] px-3 py-2.5 w-fit min-w-[200px] text-sm text-black">
              In a Dock - ABACO
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button className="p-2">
              <DeleteIcon />
            </button>
            <div className="flex gap-4">
              <button className="bg-[#e4ebf4] border border-[#132540] text-black rounded-[10px] px-8 py-3 text-lg font-medium">
                Cancel
              </button>
              <button className="bg-[#132540] border border-[#296341] text-white rounded-[10px] px-8 py-3 text-lg font-medium">
                Save
              </button>
            </div>
            <button className="p-2">
              <ChevronIcon direction="up" />
            </button>
          </div>
        </div>

        {/* Collapsed Waitlist Items */}
        <div className="space-y-4">
          <WaitlistCard name="Jane Forbes" invoiceNo="#27891" vehicleCount={1} />
          <WaitlistCard name="Jason Frank" invoiceNo="#23456" vehicleCount={1} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#296341] py-6 px-6 flex items-center justify-between mt-8">
        <div className="flex items-center gap-2">
          <img
            src="/deans-shipping-logo.png"
            alt="Dean's Shipping Ltd."
            className="h-12 object-contain"
          />
        </div>
        <div className="text-white text-lg">
          <span className="font-semibold">Freight Agent</span>
          <span className="mx-2">|</span>
          <span>Smith Frank</span>
        </div>
      </footer>
    </div>
  );
}