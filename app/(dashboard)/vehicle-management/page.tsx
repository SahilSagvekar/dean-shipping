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
  Save
} from "lucide-react";
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

// Vehicle Status Configuration
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  IN_DOCK: { label: 'In Dock', bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-purple-100', text: 'text-purple-700' },
  DELIVERED: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
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

// Collapsed Waitlist Card
function WaitlistCardCollapsed({
  vehicle,
  onExpand,
}: {
  vehicle: Vehicle;
  onExpand: () => void;
}) {
  return (
    <div 
      className="bg-[#e5f7f1] rounded-[10px] p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onExpand}
    >
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-sm font-semibold text-black">{vehicle.ownerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Invoice No.</p>
            <p className="text-sm font-semibold text-black">#{vehicle.invoiceNo || vehicle.id.slice(-6)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vehicle</p>
            <p className="text-sm font-semibold text-black">{vehicle.vehicleType}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={vehicle.status} />
          </div>
        </div>
        <button className="ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors">
          <ChevronDown className="w-6 h-6 text-[#296341]" />
        </button>
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
}: {
  vehicle: Vehicle;
  locations: Location[];
  onCollapse: () => void;
  onSave: (updated: Partial<Vehicle>) => void;
  onDelete: () => void;
  isSubmitting: boolean;
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
    notes: vehicle.notes || '',
  });

  const locationOptions = locations.map(l => ({ value: l.code, label: l.name }));
  const statusOptions = Object.entries(STATUS_CONFIG).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  return (
    <div className="bg-[#e5f7f1] rounded-[10px] p-4 space-y-4">
      {/* Row 1: Name, Email, Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField 
          label="Name" 
          value={editData.ownerName}
          onChange={(v) => setEditData(prev => ({ ...prev, ownerName: v }))}
          required
        />
        <InputField 
          label="Email" 
          value={editData.ownerEmail}
          onChange={(v) => setEditData(prev => ({ ...prev, ownerEmail: v }))}
          type="email"
        />
        <InputField 
          label="Contact" 
          value={editData.contactNo}
          onChange={(v) => setEditData(prev => ({ ...prev, contactNo: v }))}
        />
      </div>

      {/* Row 2: Invoice no, Date Added, License plate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          }).replace(/\//g, ' / ')}
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
      <div>
        <h3 className="text-lg font-semibold text-[#296341]">VEHICLE DETAILS</h3>
        <div className="w-32 h-0.5 bg-black mt-1" />
      </div>

      {/* Vehicle Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField 
          label="Vehicle Type" 
          value={editData.vehicleType}
          onChange={(v) => setEditData(prev => ({ ...prev, vehicleType: v }))}
          required
        />
        <SelectField 
          label="From" 
          value={editData.fromLocation}
          onChange={(v) => setEditData(prev => ({ ...prev, fromLocation: v }))}
          options={locationOptions}
          required
        />
        <SelectField 
          label="To" 
          value={editData.toLocation}
          onChange={(v) => setEditData(prev => ({ ...prev, toLocation: v }))}
          options={locationOptions}
          required
        />
      </div>

      {/* Status & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField 
          label="Status" 
          value={editData.status}
          onChange={(v) => setEditData(prev => ({ ...prev, status: v as Vehicle['status'] }))}
          options={statusOptions}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-black">Notes</label>
          <textarea
            value={editData.notes}
            onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
            className="bg-white border border-[#296341] rounded-[5px] px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-[#296341]/30 min-h-[80px] resize-none"
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={onDelete}
          disabled={isSubmitting}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-7 h-7 text-[#132540] hover:text-red-500" />
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onCollapse}
            className="bg-[#e4ebf4] border border-[#132540] text-black rounded-[10px] px-8 py-3 text-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(editData)}
            disabled={isSubmitting}
            className="bg-[#132540] border border-[#296341] text-white rounded-[10px] px-8 py-3 text-lg font-medium hover:bg-[#1a3254] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Save
          </button>
        </div>
        <button 
          onClick={onCollapse}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ChevronUp className="w-6 h-6 text-[#296341]" />
        </button>
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
    notes: '',
  });

  // Fetch vehicles
  const fetchVehicles = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/vehicles?page=${page}&limit=20`);
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
    fetchVehicles();
    fetchLocations();
  }, []);

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
        fetchVehicles();
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
        fetchVehicles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to remove vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationOptions = locations.map(l => ({ value: l.code, label: l.name }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
      <div className="px-6 flex gap-4 mb-8 max-w-[1200px] mx-auto">
        <button 
          onClick={() => setActiveView('add')}
          className={`flex-1 rounded-[10px] py-4 flex items-center justify-center gap-2 text-lg font-medium transition-colors ${
            activeView === 'add' 
              ? 'bg-[#296341] text-white' 
              : 'bg-[#e5f7f1] text-[#296341] border-2 border-[#296341]'
          }`}
        >
          <VehicleIcon variant="plus" />
          ADD VEHICLE
        </button>
        <button 
          onClick={() => setActiveView('list')}
          className={`flex-1 rounded-[10px] py-4 flex items-center justify-center gap-2 text-lg font-medium transition-colors ${
            activeView === 'list' 
              ? 'bg-[#296341] text-white' 
              : 'bg-[#e5f7f1] text-[#296341] border-2 border-[#296341]'
          }`}
        >
          <VehicleIcon variant="list" />
          VEHICLE WAITLIST
          {vehicles.length > 0 && (
            <span className="ml-2 bg-white text-[#296341] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
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
          <div className="flex items-center gap-2 mb-2">
            <VehicleIcon variant="list" />
            <h2 className="text-xl font-medium text-black">VEHICLE WAITLIST</h2>
            <div className="ml-2 w-10 h-10 rounded-full bg-[#e4ebf4] border-2 border-[#132540] flex items-center justify-center">
              <span className="text-lg font-bold text-[#132540]">{pagination?.total || 0}</span>
            </div>
          </div>
          <div className="w-48 h-1 bg-[#132540] rounded-full mb-4" />

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
                  />
                ) : (
                  <WaitlistCardCollapsed
                    key={vehicle.id}
                    vehicle={vehicle}
                    onExpand={() => setExpandedId(vehicle.id)}
                  />
                )
              ))}
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