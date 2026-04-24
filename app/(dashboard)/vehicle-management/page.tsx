"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  List,
  Loader2,
  X,
  Car,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Edit2,
  Save,
  Ship,
  ArrowRight,
  Anchor,
  CheckSquare,
  Square,
  CreditCard,
  Search
} from "lucide-react";
import { DashboardBanner } from "@/components/ui/DashboardBanner";
import image2 from "@/app/assets/cc1821c6ea8a81adb203fcf9b1bb2ee371bbcbed.png";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

// Types
interface Location {
  id: string;
  code: string;
  name: string;
}

interface Vehicle {
  id: string;
  registrationNo: string;
  ownerName: string;
  ownerEmail?: string;
  contactNo: string;
  vehicleType: string;
  fromLocation: string;
  toLocation: string;
  bookingDate: string;
  status: 'PENDING' | 'IN_DOCK' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  invoiceNo?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface VoyageStop {
  id: string;
  location: Location;
  stopOrder?: number;
  order?: number;
}

interface Voyage {
  id: string;
  voyageNo: string | number;
  date?: string;
  departureDate?: string;
  ship?: { name: string };
  from?: Location;
  to?: Location;
  stops?: VoyageStop[];
}

// Vehicle Status Configuration
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  IN_DOCK: { label: 'In Dock', bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-purple-100', text: 'text-purple-700' },
  DELIVERED: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

const PAYMENT_STATUS_CONFIG = {
  PAID: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700' },
  UNPAID: { label: 'Unpaid', bg: 'bg-red-100', text: 'text-red-700' },
  PARTIAL: { label: 'Partial', bg: 'bg-blue-100', text: 'text-blue-700' },
};

// Vehicle Icon Component
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

// Input Field Component
function InputField({
  label,
  value,
  onChange,
  readonly = false,
  type = "text",
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {readonly ? (
        <div className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 text-sm text-black min-h-[42px]">
          {value || '-'}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-[#296341]/30"
        />
      )}
    </div>
  );
}

// Select Field Component
function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-[#296341]/30 appearance-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: Vehicle['status'] }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
      {config.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: Vehicle['paymentStatus'] }) {
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.UNPAID;
  return (
    <span className={`${config.bg} ${config.text} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1`}>
      <CreditCard className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

// Collapsed Waitlist Card
function WaitlistCardCollapsed({
  vehicle,
  onExpand,
  isSelected,
  onToggleSelect,
}: {
  vehicle: Vehicle;
  onExpand: () => void;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  return (
    <div 
      className="bg-[#e5f7f1] rounded-xl p-4 sm:p-5 cursor-pointer hover:shadow-md transition-all border border-[#296341]/5 hover:border-[#296341]/20 active:scale-[0.99] group"
      onClick={onExpand}
    >
      <div className="flex items-center gap-4">
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(e);
          }}
          className="p-1 hover:bg-white/50 rounded-md transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-6 h-6 text-[#296341]" />
          ) : (
            <Square className="w-6 h-6 text-[#296341]/40" />
          )}
        </div>
        <div className="flex-1 flex items-center justify-between" onClick={onExpand}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 flex-1">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] sm:text-xs font-black text-[#296341]/60 uppercase tracking-tighter">Owner Name</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{vehicle.ownerName}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-black text-[#296341]/60 uppercase tracking-tighter">Invoice No.</p>
              <p className="text-sm sm:text-base font-mono font-bold text-gray-900">
                #{vehicle.invoiceNo || vehicle.id.slice(-6)}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] sm:text-xs font-black text-[#296341]/60 uppercase tracking-tighter">Vehicle Type</p>
              <p className="text-sm sm:text-base font-bold text-gray-900">{vehicle.vehicleType}</p>
            </div>
            <div className="flex flex-col items-end gap-1 sm:justify-center">
              <StatusBadge status={vehicle.status} />
              <PaymentBadge status={vehicle.paymentStatus} />
            </div>
          </div>
          <div className="ml-4 p-2 bg-white/40 rounded-lg group-hover:bg-white transition-colors">
            <ChevronDown className="w-5 h-5 sm:w-6 h-6 text-[#296341]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Expanded Waitlist Card
function WaitlistCardExpanded({
  vehicle,
  locations,
  onCollapse,
  onSave,
  onDelete,
  isSubmitting,
  isSelected,
  onToggleSelect,
}: {
  vehicle: Vehicle;
  locations: Location[];
  onCollapse: () => void;
  onSave: (updated: Partial<Vehicle>) => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  const [editData, setEditData] = useState({
    ownerName: vehicle.ownerName,
    ownerEmail: vehicle.ownerEmail || '',
    contactNo: vehicle.contactNo,
    registrationNo: vehicle.registrationNo,
    vehicleType: vehicle.vehicleType,
    fromLocation: vehicle.fromLocation,
    toLocation: vehicle.toLocation,
    status: vehicle.status,
    paymentStatus: vehicle.paymentStatus || 'UNPAID',
    totalAmount: vehicle.totalAmount || 0,
    notes: vehicle.notes || '',
  });

  const locationOptions = locations.map(l => ({ value: l.code, label: l.name }));
  const statusOptions = Object.entries(STATUS_CONFIG).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  return (
    <div className="bg-[#e5f7f1] rounded-2xl p-4 sm:p-6 space-y-6 shadow-inner border border-[#296341]/10">
      <div className="flex items-center justify-between border-b border-[#296341]/10 pb-4">
        <div className="flex items-center gap-3">
          <div 
            onClick={onToggleSelect}
            className="cursor-pointer hover:bg-white/50 p-1 rounded-md transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-6 h-6 text-[#296341]" />
            ) : (
              <Square className="w-6 h-6 text-[#296341]/40" />
            )}
          </div>
          <span className="text-sm font-black text-[#296341] uppercase tracking-widest">Selection Status</span>
        </div>
        <button onClick={onCollapse} className="text-[#296341] hover:bg-white/50 p-2 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Row 1: Name, Email, Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <InputField 
          label="Owner Name" 
          value={editData.ownerName}
          onChange={(v) => setEditData(prev => ({ ...prev, ownerName: v }))}
          required
        />
        <InputField 
          label="Email Address" 
          value={editData.ownerEmail}
          onChange={(v) => setEditData(prev => ({ ...prev, ownerEmail: v }))}
          type="email"
        />
        <InputField 
          label="Contact Number" 
          value={editData.contactNo}
          onChange={(v) => setEditData(prev => ({ ...prev, contactNo: v }))}
        />
      </div>

      {/* Row 2: Invoice no, Date Added, License plate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <InputField 
          label="Invoice No." 
          value={`#${vehicle.invoiceNo || vehicle.id.slice(-6)}`}
          readonly
        />
        <InputField 
          label="Date Added" 
          value={new Date(vehicle.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
          readonly
        />
        <InputField 
          label="License Plate" 
          value={editData.registrationNo}
          onChange={(v) => setEditData(prev => ({ ...prev, registrationNo: v }))}
          required
        />
      </div>

      {/* Vehicle Details Header */}
      <div className="pt-2">
        <h3 className="text-base sm:text-lg font-black text-[#296341] flex items-center gap-2">
          <Car className="w-5 h-5" /> VEHICLE DETAILS
        </h3>
        <div className="w-24 h-1 bg-[#132540] mt-1 rounded-full" />
      </div>

      {/* Vehicle Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <InputField 
          label="Vehicle Type" 
          value={editData.vehicleType}
          onChange={(v) => setEditData(prev => ({ ...prev, vehicleType: v }))}
          required
        />
        <SelectField 
          label="From Location" 
          value={editData.fromLocation}
          onChange={(v) => setEditData(prev => ({ ...prev, fromLocation: v }))}
          options={locationOptions}
          required
        />
        <SelectField 
          label="To Location" 
          value={editData.toLocation}
          onChange={(v) => setEditData(prev => ({ ...prev, toLocation: v }))}
          options={locationOptions}
          required
        />
      </div>

      {/* Status & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <SelectField 
          label="Registry Status" 
          value={editData.status}
          onChange={(v) => setEditData(prev => ({ ...prev, status: v as Vehicle['status'] }))}
          options={statusOptions}
        />
        <SelectField 
          label="Payment Status" 
          value={editData.paymentStatus}
          onChange={(v) => setEditData(prev => ({ ...prev, paymentStatus: v as Vehicle['paymentStatus'] }))}
          options={Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <InputField 
          label="Total Amount" 
          value={(editData.totalAmount || 0).toString()}
          onChange={(v) => setEditData(prev => ({ ...prev, totalAmount: parseFloat(v) || 0 }))}
          type="number"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Additional Notes</label>
          <textarea
            value={editData.notes}
            onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
            className="bg-white border border-[#296341] rounded-xl px-4 py-3 text-sm text-black outline-none focus:ring-4 focus:ring-[#296341]/10 min-h-[100px] resize-none shadow-sm"
            placeholder="Enter any additional details here..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#296341]/10">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onDelete}
            disabled={isSubmitting}
            className="p-3 bg-white hover:bg-red-50 rounded-xl transition-all border border-gray-100 flex items-center justify-center group"
            title="Delete Vehicle"
          >
            <Trash2 className="w-6 h-6 text-[#132540] group-hover:text-red-500 transition-colors" />
          </button>
          <button 
            onClick={onCollapse}
            className="flex-1 sm:hidden p-3 bg-white text-[#132540] rounded-xl font-bold border border-gray-200"
          >
            Close Detail
          </button>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onCollapse}
            className="hidden sm:block bg-white border border-gray-200 text-[#132540] rounded-xl px-6 py-3 font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(editData)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-[#132540] text-white rounded-xl px-8 py-3 font-bold hover:bg-[#1a3254] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
          
          {vehicle.paymentStatus !== 'PAID' && (
            <button 
              onClick={() => onSave({ paymentStatus: 'PAID' })}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-[#296341] text-white rounded-xl px-8 py-3 font-bold hover:bg-[#1e4a2e] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay Now
            </button>
          )}

          <button 
            onClick={onCollapse}
            className="hidden sm:flex p-3 hover:bg-white rounded-xl transition-all"
          >
            <ChevronUp className="w-6 h-6 text-[#296341]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function VehicleWaitlistPage() {
  const { apiFetch, user } = useAuth();
  const [activeView, setActiveView] = useState<'add' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Voyage state
  const [upcomingVoyages, setUpcomingVoyages] = useState<Voyage[]>([]);
  const [isLoadingVoyages, setIsLoadingVoyages] = useState(false);
  const [selectedVoyageId, setSelectedVoyageId] = useState<string>("");

  // Add form state
  const [newVehicle, setNewVehicle] = useState({
    ownerName: '',
    ownerEmail: '',
    contactNo: '',
    registrationNo: '',
    vehicleType: '',
    fromLocation: '',
    toLocation: '',
    bookingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'UNPAID' as Vehicle['paymentStatus'],
    totalAmount: 0,
    notes: '',
  });

  // Fetch vehicles
  const fetchVehicles = async (page = 1, search = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/vehicles?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const res = await apiFetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
        if (data.locations?.length > 0) {
          setNewVehicle(prev => ({
            ...prev,
            fromLocation: data.locations[0].code,
            toLocation: data.locations.length > 1 ? data.locations[1].code : data.locations[0].code,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeView === 'list') {
        fetchVehicles(1, searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeView]);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch Voyages
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

  // Pre-fill user details
  useEffect(() => {
    if (user) {
      setNewVehicle(prev => ({
        ...prev,
        ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        ownerEmail: user.email || '',
        contactNo: user.mobileNumber || '',
      }));
    }
  }, [user]);

  // Helper to get locations for a specific voyage
  const getVoyageLocationsForVoyage = (voyage: Voyage): Location[] => {
    const voyageLocations: Location[] = [];
    
    if (voyage.from) {
      voyageLocations.push(voyage.from);
    }
    
    if (voyage.stops && voyage.stops.length > 0) {
      voyage.stops
        .sort((a, b) => (a.stopOrder || a.order || 0) - (b.stopOrder || b.order || 0))
        .forEach((stop: VoyageStop) => {
          if (!voyageLocations.find(l => l.id === stop.location.id)) {
            voyageLocations.push(stop.location);
          }
        });
    }
    
    if (voyage.to && !voyageLocations.find(l => l.id === voyage.to?.id)) {
      voyageLocations.push(voyage.to);
    }
    
    return voyageLocations;
  };

  // Handle voyage selection
  const handleVoyageSelect = (voyageId: string) => {
    setSelectedVoyageId(voyageId);
    
    if (voyageId) {
      const voyage = upcomingVoyages.find(v => v.id === voyageId);
      if (voyage) {
        // Auto-set booking date to voyage departure date if available
        const voyageDate = voyage.date || voyage.departureDate;
        if (voyageDate) {
          try {
            const depDate = new Date(voyageDate).toISOString().split('T')[0];
            setNewVehicle(prev => ({ ...prev, bookingDate: depDate }));
          } catch (e) {
            console.error("Error parsing voyage date:", e);
          }
        }
        
        // Get voyage locations and set defaults
        const voyageLocations = getVoyageLocationsForVoyage(voyage);
        if (voyageLocations.length >= 2) {
          setNewVehicle(prev => ({
            ...prev,
            fromLocation: voyageLocations[0].code,
            toLocation: voyageLocations[voyageLocations.length - 1].code
          }));
        } else if (voyageLocations.length === 1) {
          setNewVehicle(prev => ({ ...prev, fromLocation: voyageLocations[0].code }));
        }
      }
    } else {
      // Cleared selection
      if (locations.length > 0) {
        setNewVehicle(prev => ({
          ...prev,
          fromLocation: locations[0].code,
          toLocation: locations.length > 1 ? locations[1].code : locations[0].code
        }));
      }
    }
  };

  const selectedVoyage = upcomingVoyages.find(v => v.id === selectedVoyageId);

  // Add vehicle
  const handleAddVehicle = async () => {
    // Validation
    const errors: string[] = [];
    if (!newVehicle.ownerName.trim()) errors.push('Owner name is required');
    if (!newVehicle.registrationNo.trim()) errors.push('License plate is required');
    if (!newVehicle.vehicleType.trim()) errors.push('Vehicle type is required');
    if (!newVehicle.fromLocation) errors.push('From location is required');
    if (!newVehicle.toLocation) errors.push('To location is required');
    if (!newVehicle.bookingDate) errors.push('Booking date is required');
    if (newVehicle.fromLocation === newVehicle.toLocation) {
      errors.push('From and To locations cannot be the same');
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });

      if (res.ok) {
        toast.success('Vehicle added to waitlist');
        // Reset form
        setNewVehicle({
          ownerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          ownerEmail: user?.email || '',
          contactNo: user?.mobileNumber || '',
          registrationNo: '',
          vehicleType: '',
          fromLocation: locations[0]?.code || '',
          toLocation: locations[1]?.code || locations[0]?.code || '',
          bookingDate: new Date().toISOString().split('T')[0],
          paymentStatus: 'UNPAID',
          totalAmount: 0,
          notes: '',
        });
        // Refresh list and switch to list view
        fetchVehicles();
        setActiveView('list');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update vehicle
  const handleUpdateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        toast.success('Vehicle updated');
        setExpandedId(null);
        fetchVehicles(pagination?.page || 1);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from the waitlist?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Vehicle removed from waitlist');
        setExpandedId(null);
        fetchVehicles(pagination?.page || 1);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove vehicle');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk update vehicle status
  const handleBulkStatusUpdate = async (status: Vehicle['status']) => {
    if (selectedIds.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/vehicles/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          status,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Updated ${data.count || selectedIds.length} vehicles to ${STATUS_CONFIG[status].label}`);
        setSelectedIds([]);
        fetchVehicles(pagination?.page || 1);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update vehicles');
      }
    } catch (error) {
      console.error('Error bulk updating vehicles:', error);
      toast.error('Failed to update vehicles');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk update payment status
  const handleBulkPaymentUpdate = async (paymentStatus: Vehicle['paymentStatus']) => {
    if (selectedIds.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/vehicles/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          paymentStatus,
        }),
      });
  
      if (res.ok) {
        const data = await res.json();
        toast.success(`Updated ${data.count || selectedIds.length} vehicles to ${PAYMENT_STATUS_CONFIG[paymentStatus].label}`);
        setSelectedIds([]);
        fetchVehicles(pagination?.page || 1);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update payments');
      }
    } catch (error) {
      console.error('Error bulk updating payments:', error);
      toast.error('Failed to update payments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    const currentPageIds = vehicles.map(v => v.id);
    const allOnPageSelected = currentPageIds.every(id => selectedIds.includes(id));
    
    if (allOnPageSelected) {
      // Remove all current page IDs
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Add missing current page IDs
      setSelectedIds(prev => {
        const newSelection = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelection.includes(id)) newSelection.push(id);
        });
        return newSelection;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const locationOptions = locations.map(l => ({ value: l.code, label: l.name }));

  return (
    <div className="min-h-screen bg-white">
      {/* Standardized Hero Banner */}
      <DashboardBanner 
        imageSrc={image2.src} 
        alt="Vehicle" 
        objectFit="contain"
        className="bg-white/50 mb-0"
      />

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-[1200px] mx-auto mt-4 sm:mt-6">
        <button 
          onClick={() => setActiveView('add')}
          className={`flex-1 rounded-xl py-3 sm:py-4 flex items-center justify-center gap-3 text-base sm:text-lg font-bold tracking-wide transition-all active:scale-[0.98] ${
            activeView === 'add' 
              ? 'bg-[#296341] text-white shadow-lg shadow-[#296341]/20' 
              : 'bg-[#e5f7f1] text-[#296341] border-2 border-[#296341] hover:bg-[#d1f0e5]'
          }`}
        >
          <VehicleIcon variant="plus" />
          <span className="uppercase">Add Vehicle</span>
        </button>
        <button 
          onClick={() => setActiveView('list')}
          className={`flex-1 rounded-xl py-3 sm:py-4 flex items-center justify-center gap-3 text-base sm:text-lg font-bold tracking-wide transition-all active:scale-[0.98] ${
            activeView === 'list' 
              ? 'bg-[#296341] text-white shadow-lg shadow-[#296341]/20' 
              : 'bg-[#e5f7f1] text-[#296341] border-2 border-[#296341] hover:bg-[#d1f0e5]'
          }`}
        >
          <VehicleIcon variant="list" />
          <span className="uppercase">Vehicle Waitlist</span>
          {vehicles.length > 0 && (
            <span className="ml-1 sm:ml-2 bg-white text-[#296341] rounded-full min-w-[24px] sm:min-w-[32px] h-6 sm:h-8 px-1 flex items-center justify-center text-xs sm:text-sm font-black shadow-sm">
              {vehicles.length}
            </span>
          )}
        </button>
      </div>

      {/* Add Vehicle Section */}
      {activeView === 'add' && (
        <section className="px-6 mb-8 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <VehicleIcon variant="plus" />
            <h2 className="text-xl font-medium text-black">ADD VEHICLE TO WAITLIST</h2>
          </div>
          <div className="w-48 h-1 bg-[#132540] rounded-full mb-4" />

          <div className="bg-[#e5f7f1] rounded-[10px] p-6 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#296341] uppercase tracking-wider">
                 Linked Voyage (Optional)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#296341]">
                  <Ship className="w-5 h-5" />
                </div>
                <select 
                  value={selectedVoyageId}
                  onChange={(e) => handleVoyageSelect(e.target.value)}
                  disabled={isLoadingVoyages}
                  className="w-full bg-white border-2 border-[#296341] rounded-xl pl-12 pr-10 py-3 text-lg font-bold text-gray-800 outline-none focus:ring-4 focus:ring-[#296341]/10 transition-all appearance-none cursor-pointer disabled:opacity-60"
                >
                  <option value="">-- No Voyage Selected --</option>
                  {upcomingVoyages.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.voyageNo} - {v.ship?.name || 'Vessel'} ({v.date ? new Date(v.date).toLocaleDateString() : 'No date'})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>

              {selectedVoyage && (
                <div className="mt-4 bg-white/60 rounded-xl p-4 border border-[#296341]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-[#296341]" />
                      <span className="text-sm font-bold text-gray-900">
                        {selectedVoyage.ship?.name || 'Ship'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-[#296341] bg-[#eef6f2] px-3 py-1 rounded-full uppercase">
                        {selectedVoyage.from?.name || selectedVoyage.from?.code}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-black text-[#296341] bg-[#eef6f2] px-3 py-1 rounded-full uppercase">
                        {selectedVoyage.to?.name || selectedVoyage.to?.code}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#e5f7f1] rounded-[10px] p-4 space-y-4">
            {/* Row 1: Name, Email, Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField 
                label="Owner Name" 
                value={newVehicle.ownerName}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, ownerName: v }))}
                placeholder="Enter owner name"
                required
              />
              <InputField 
                label="Email" 
                value={newVehicle.ownerEmail}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, ownerEmail: v }))}
                type="email"
                placeholder="Enter email"
              />
              <InputField 
                label="Contact" 
                value={newVehicle.contactNo}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, contactNo: v }))}
                placeholder="+1 1234 5678"
              />
            </div>

            {/* Row 2: License plate, Date, Vehicle Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField 
                label="License Plate" 
                value={newVehicle.registrationNo}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, registrationNo: v }))}
                placeholder="BD 1234"
                required
              />
              <InputField 
                label="Booking Date" 
                value={newVehicle.bookingDate}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, bookingDate: v }))}
                type="date"
                required
              />
              <InputField 
                label="Vehicle Type" 
                value={newVehicle.vehicleType}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, vehicleType: v }))}
                placeholder="Honda Creta"
                required
              />
            </div>

            {/* Row 3: From, To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField 
                label="From" 
                value={newVehicle.fromLocation}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, fromLocation: v }))}
                options={locationOptions}
                required
              />
              <SelectField 
                label="To" 
                value={newVehicle.toLocation}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, toLocation: v }))}
                options={locationOptions}
                required
              />
            </div>
            
            {/* Row 4: Payment Status, Total Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField 
                label="Payment Status" 
                value={newVehicle.paymentStatus}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, paymentStatus: v as Vehicle['paymentStatus'] }))}
                options={Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <InputField 
                label="Total Amount" 
                value={newVehicle.totalAmount.toString()}
                onChange={(v) => setNewVehicle(prev => ({ ...prev, totalAmount: parseFloat(v) || 0 }))}
                type="number"
                placeholder="0.00"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-black">Details / Notes</label>
              <textarea
                value={newVehicle.notes}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 min-h-[80px] text-sm text-black outline-none focus:ring-2 focus:ring-[#296341]/30 resize-none"
                placeholder="Any additional details..."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-2">
              <button 
                onClick={handleAddVehicle}
                disabled={isSubmitting}
                className="bg-[#132540] text-white rounded-[10px] px-12 py-3 text-lg font-medium hover:bg-[#1a3254] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Add to Waitlist
              </button>
            </div>
          </div>
        </section>
      )}

      {/* View Vehicle Waitlist Section */}
      {activeView === 'list' && (
        <section className="px-6 mb-8 max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <VehicleIcon variant="list" />
              <h2 className="text-xl font-medium text-black uppercase">VEHICLE WAITLIST</h2>
              <div className="ml-2 w-10 h-10 rounded-full bg-[#e4ebf4] border-2 border-[#132540] flex items-center justify-center">
                <span className="text-lg font-bold text-[#132540]">{pagination?.total || 0}</span>
              </div>
            </div>

            <div className="flex-1 max-w-md relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#296341] transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search by owner, plate, or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl pl-11 pr-10 py-2.5 text-sm outline-none focus:bg-white focus:border-[#296341] focus:ring-4 focus:ring-[#296341]/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {vehicles.length > 0 && (
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-[#e5f7f1] text-[#296341] rounded-lg font-bold text-sm hover:bg-[#d1f0e5] transition-colors"
                >
                  {selectedIds.length === vehicles.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  {selectedIds.length === vehicles.length ? 'DESELECT ALL' : 'SELECT ALL PAGE'}
                </button>
              )}
            </div>
          </div>
          <div className="w-48 h-1 bg-[#132540] rounded-full mb-6" />

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#296341]" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20 bg-[#e5f7f1] rounded-[10px]">
              <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-gray-500">No vehicles in waitlist</p>
              <button
                onClick={() => setActiveView('add')}
                className="mt-4 bg-[#296341] text-white px-6 py-2 rounded-lg hover:bg-[#1e4a2e] transition-colors"
              >
                Add First Vehicle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                expandedId === vehicle.id ? (
                  <WaitlistCardExpanded
                    key={vehicle.id}
                    vehicle={vehicle}
                    locations={locations}
                    onCollapse={() => setExpandedId(null)}
                    onSave={(updates) => handleUpdateVehicle(vehicle.id, updates)}
                    onDelete={() => handleDeleteVehicle(vehicle.id)}
                    isSubmitting={isSubmitting}
                    isSelected={selectedIds.includes(vehicle.id)}
                    onToggleSelect={(e) => {
                      e.stopPropagation();
                      toggleSelect(vehicle.id);
                    }}
                  />
                ) : (
                  <WaitlistCardCollapsed
                    key={vehicle.id}
                    vehicle={vehicle}
                    onExpand={() => setExpandedId(vehicle.id)}
                    isSelected={selectedIds.includes(vehicle.id)}
                    onToggleSelect={(e) => {
                      e.stopPropagation();
                      toggleSelect(vehicle.id);
                    }}
                  />
                )
              ))}

              {/* Bulk Action Bar */}
              {selectedIds.length > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[800px] animate-in slide-in-from-bottom-8 duration-500">
                  <div className="bg-[#132540] rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#296341] flex items-center justify-center text-white font-black text-lg">
                        {selectedIds.length}
                      </div>
                      <div>
                        <p className="text-white font-black uppercase tracking-widest text-sm">Vehicles Selected</p>
                        <p className="text-[#296341] text-xs font-bold italic">Bulk Registry Update Active</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                      <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-2">
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => handleBulkStatusUpdate(key as Vehicle['status'])}
                            disabled={isSubmitting}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 ${config.bg} ${config.text} hover:scale-105 shadow-sm`}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => handleBulkPaymentUpdate(key as Vehicle['paymentStatus'])}
                            disabled={isSubmitting}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 ${config.bg} ${config.text} hover:scale-105 shadow-sm flex items-center gap-1`}
                          >
                            <CreditCard className="w-3 h-3" />
                            {config.label}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setSelectedIds([])}
                        className="p-2 text-white/50 hover:text-white transition-colors ml-2"
                        title="Clear Selection"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#296341]/10 mt-12">
                  <div className="flex flex-col items-center sm:items-start">
                    <p className="text-[14px] lg:text-[16px] font-black italic text-[#296341] uppercase tracking-widest">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </p>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">Total Capacity: {pagination.total} Records</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fetchVehicles(pagination.page - 1)}
                      disabled={pagination.page <= 1 || isLoading}
                      className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-[10px] border-2 border-gray-100 disabled:opacity-20 hover:bg-gray-50 hover:border-[#296341] hover:text-[#296341] transition-all active:scale-90 shadow-sm"
                    >
                      <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 rotate-90" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {(() => {
                        const total = pagination.totalPages;
                        const current = pagination.page;
                        const pages: (number | string)[] = [];
                        
                        if (total <= 7) {
                          for (let i = 1; i <= total; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          if (current > 3) pages.push("...");
                          
                          const start = Math.max(2, current - 1);
                          const end = Math.min(total - 1, current + 1);
                          
                          for (let i = start; i <= end; i++) {
                            if (!pages.includes(i)) pages.push(i);
                          }
                          
                          if (current < total - 2) pages.push("...");
                          if (!pages.includes(total)) pages.push(total);
                        }
                        
                        return pages.map((pageNum, idx) => (
                          <button
                            key={idx}
                            onClick={() => typeof pageNum === 'number' ? fetchVehicles(pageNum) : null}
                            disabled={typeof pageNum !== 'number' || isLoading}
                            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-[10px] font-black text-[14px] lg:text-[18px] transition-all transform active:scale-95 shadow-sm ${
                              pageNum === pagination.page
                                ? "bg-[#296341] text-white shadow-lg shadow-[#296341]/30 -translate-y-1"
                                : typeof pageNum !== 'number'
                                ? "cursor-default text-gray-300"
                                : "bg-white border-2 border-gray-50 text-[#132540] hover:border-[#296341] hover:text-[#296341]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ));
                      })()}
                    </div>
                    
                    <button
                      onClick={() => fetchVehicles(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages || isLoading}
                      className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-[10px] border-2 border-gray-100 disabled:opacity-20 hover:bg-gray-50 hover:border-[#296341] hover:text-[#296341] transition-all active:scale-90 shadow-sm"
                    >
                      <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 -rotate-90" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#296341] py-6 px-6 flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
        <div className="flex items-center gap-2">
          <img
            src={imgLogo.src}
            alt="Dean's Shipping Ltd."
            className="h-12 object-contain"
          />
        </div>
        <div className="text-white text-lg text-center md:text-right">
          <span className="font-semibold">Freight Agent</span>
          <span className="mx-2">|</span>
          <span>{user ? `${user.firstName} ${user.lastName}` : 'Staff'}</span>
        </div>
      </footer>
    </div>
  );
}