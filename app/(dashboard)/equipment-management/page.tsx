"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Trash2,
  Plus,
  Loader2,
  Settings,
  Package,
  Truck,
  Box,
  Container,
  Edit2,
  X,
  AlertCircle,
  Search
} from "lucide-react";
import image from "@/app/assets/e6c79afe715811b9fb95363def64518d57e9451c.png";
import { DashboardBanner } from "@/components/ui/DashboardBanner";

// Types
interface Location {
  id: string;
  code: string;
  name: string;
}

interface Equipment {
  id: string;
  type: string;
  name: string;
  identifier?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  isActive: boolean;
  location: {
    code: string;
    name: string;
  };
  assignments?: {
    assignedTo: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  createdAt: string;
}

interface GroupedEquipment {
  [key: string]: Equipment[];
}

// Equipment type configuration
const EQUIPMENT_TYPES = [
  { 
    type: 'FORKLIFT', 
    label: 'FORKLIFT', 
    bgColor: 'bg-[#c2d9d1]', 
    badgeBg: 'bg-[#e5f7f1]',
    icon: 'forklift'
  },
  { 
    type: 'MULE', 
    label: 'MULE / TRACTOR', 
    bgColor: 'bg-[rgba(228,153,166,0.7)]', 
    badgeBg: 'bg-[#ffdfe7]',
    icon: 'truck'
  },
  { 
    type: 'CHASSIS', 
    label: 'CHASSIS', 
    bgColor: 'bg-[rgba(120,151,255,0.7)]', 
    badgeBg: 'bg-[#ebe2ff]',
    icon: 'chassis'
  },
  { 
    type: 'CONTAINER', 
    label: 'CONTAINER', 
    bgColor: 'bg-[rgba(199,190,144,0.7)]', 
    badgeBg: 'bg-[#f7f4e5]',
    icon: 'container'
  },
  { 
    type: 'FLAT_RACK', 
    label: 'FLAT RACK', 
    bgColor: 'bg-[#99d9e4]', 
    badgeBg: 'bg-[#e5f7f5]',
    icon: 'flatrack'
  },
];

// Icon Components
function ForkliftIcon({ className = "w-8 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 52" fill="none">
      <path
        d="M55 40H50V15C50 13.5 49 12 47.5 11.5L35 7V3C35 1.5 33.5 0 32 0H22C20.5 0 19 1.5 19 3V7L6.5 11.5C5 12 4 13.5 4 15V40H0V45H4C4 48.5 7 52 10.5 52C14 52 17 49 17 45.5H37C37 49 40 52 43.5 52C47 52 50 49 50 45.5V45H55V40ZM10.5 47C9 47 8 46 8 44.5C8 43 9 42 10.5 42C12 42 13 43 13 44.5C13 46 12 47 10.5 47ZM43.5 47C42 47 41 46 41 44.5C41 43 42 42 43.5 42C45 42 46 43 46 44.5C46 46 45 47 43.5 47Z"
        fill="#296341"
      />
    </svg>
  );
}

function TruckIcon({ className = "w-9 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 72 56" fill="none">
      <path
        d="M64 16H54V4C54 2 52 0 50 0H4C2 0 0 2 0 4V40C0 42 2 44 4 44H8C8 50 13 56 20 56C27 56 32 51 32 44H40C40 50 45 56 52 56C59 56 64 51 64 44H68C70 44 72 42 72 40V28L64 16ZM20 50C16 50 14 47 14 44C14 41 17 38 20 38C23 38 26 41 26 44C26 47 24 50 20 50ZM52 50C48 50 46 47 46 44C46 41 49 38 52 38C55 38 58 41 58 44C58 47 56 50 52 50ZM54 28V22H62L66 28H54Z"
        fill="#296341"
      />
    </svg>
  );
}

function ChassisIcon({ className = "w-7 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 52" fill="none">
      <path
        d="M38 20H32V4C32 2 30 0 28 0H14C12 0 10 2 10 4V20H4C2 20 0 22 0 24V48C0 50 2 52 4 52H38C40 52 42 50 42 48V24C42 22 40 20 38 20ZM14 4H28V20H14V4ZM21 44C17 44 14 41 14 37C14 33 17 30 21 30C25 30 28 33 28 37C28 41 25 44 21 44Z"
        fill="#296341"
      />
    </svg>
  );
}

function ContainerIcon({ className = "w-8 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 55 48" fill="none">
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

function getEquipmentIcon(iconType: string) {
  switch (iconType) {
    case 'forklift': return <ForkliftIcon />;
    case 'truck': return <TruckIcon />;
    case 'chassis': return <ChassisIcon />;
    case 'container': return <ContainerIcon />;
    case 'flatrack': return <ContainerIcon />;
    default: return <Package className="w-8 h-8 text-[#296341]" />;
  }
}

// Count Badge Component
function CountBadge({ count, bgColor = "bg-[#e5f7f1]" }: { count: number; bgColor?: string }) {
  return (
    <div className={`${bgColor} border border-[#296341] rounded-full w-10 h-8 flex items-center justify-center`}>
      <span className="text-[#296341] font-medium text-sm">{count}</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: Equipment['status'] }) {
  const config = {
    AVAILABLE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Available' },
    OCCUPIED: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Use' },
    MAINTENANCE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Maintenance' },
  };
  const { bg, text, label } = config[status] || config.AVAILABLE;
  
  return (
    <span className={`${bg} ${text} px-2 py-0.5 rounded-full text-xs font-medium`}>
      {label}
    </span>
  );
}

// Equipment Category Component
function EquipmentCategory({
  config,
  items,
  expanded,
  onToggle,
  onDelete,
  onEdit,
  onAssignToMe,
  onRelease,
  isUpdating,
  user,
}: {
  config: typeof EQUIPMENT_TYPES[0];
  items: Equipment[];
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onEdit: (item: Equipment) => void;
  onAssignToMe: (id: string) => void;
  onRelease: (id: string) => void;
  isUpdating: string | null;
  user: any;
}) {
  const isAssignedToUser = items.some(item => 
    item.status === 'OCCUPIED' && item.assignments?.[0]?.assignedTo?.id === user?.id
  );
  
  const isAdmin = user?.role === 'ADMIN';
  return (
    <div className={`${config.bgColor} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div
        className="bg-white mx-2 my-3 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 flex justify-center">
            {getEquipmentIcon(config.icon)}
          </div>
          <span className="text-[#296341] font-semibold text-lg md:text-xl">
            {config.label}
          </span>
          <CountBadge count={items.length} bgColor={config.badgeBg} />
        </div>
        {expanded ? (
          <ChevronUp className="w-6 h-6 text-[#296341]" />
        ) : (
          <ChevronDown className="w-6 h-6 text-[#296341]" />
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-2 pb-3 space-y-2">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl px-4 py-6 text-center text-gray-500">
              No {config.label.toLowerCase()} equipment found
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-black text-base md:text-lg">
                    {item.name}
                  </span>
                  {item.identifier && (
                    <span className="text-gray-500 text-sm">#{item.identifier}</span>
                  )}
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-5 h-5 text-[#296341]" />
                    <span className="text-black font-medium text-base">
                      {item.location?.name || item.location?.code || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'AVAILABLE' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignToMe(item.id);
                        }}
                        disabled={isUpdating === item.id}
                        className="bg-[#296341] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1e4a2e] transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isUpdating === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Truck className="w-3 h-3" />
                        )}
                        USE
                      </button>
                    ) : item.status === 'OCCUPIED' ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-medium italic">
                            By {item.assignments?.[0]?.assignedTo?.firstName || 'Unknown'} {item.assignments?.[0]?.assignedTo?.lastName || ''}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRelease(item.id);
                            }}
                            disabled={isUpdating === item.id || (!isAdmin && item.assignments?.[0]?.assignedTo?.id !== user?.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1 ${
                              !isAdmin && item.assignments?.[0]?.assignedTo?.id !== user?.id
                                ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                                : 'bg-gray-100 text-[#296341] border border-[#296341] hover:bg-gray-200'
                            }`}
                            title={!isAdmin && item.assignments?.[0]?.assignedTo?.id !== user?.id ? "Only the assigned agent or admin can release" : "Release equipment"}
                          >
                            {isUpdating === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Package className="w-3 h-3" />
                            )}
                            RELEASE
                          </button>
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 border-l pl-2 border-gray-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5 text-[#296341]" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="p-1 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-[#296341] hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function EquipmentManagementPage() {
  const { apiFetch, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedEquipment, setGroupedEquipment] = useState<GroupedEquipment>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("CHASSIS");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    type: 'CONTAINER',
    name: '',
    identifier: '',
    locationCode: '',
  });

  // Edit modal state
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch equipment
  const fetchEquipment = async (search = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/equipment${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setGroupedEquipment(data.grouped || {});
      } else {
        toast.error('Failed to load equipment');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
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
        if (data.locations?.length > 0 && !newEquipment.locationCode) {
          setNewEquipment(prev => ({ ...prev, locationCode: data.locations[0].code }));
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading) {
        fetchEquipment(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchLocations();
    }
  }, [authLoading]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Add new equipment
  const handleAddEquipment = async () => {
    if (!newEquipment.name.trim()) {
      toast.error('Please enter equipment name');
      return;
    }
    if (!newEquipment.locationCode) {
      toast.error('Please select a location');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEquipment),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`${newEquipment.name} added successfully`);
        
        // Reset form
        setNewEquipment({
          type: 'CONTAINER',
          name: '',
          identifier: '',
          locationCode: locations[0]?.code || '',
        });
        setShowAddForm(false);
        
        // Refresh list
        fetchEquipment();
        
        // Expand the category of the new item
        setExpandedCategory(newEquipment.type);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add equipment');
      }
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete equipment
  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this equipment?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Equipment removed');
        fetchEquipment();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Failed to remove equipment');
    } finally {
      setDeletingId(null);
    }
  };

  // Edit equipment
  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEquipment) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/equipment/${editingEquipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingEquipment.name,
          identifier: editingEquipment.identifier,
          locationCode: editingEquipment.location.code,
        }),
      });

      if (res.ok) {
        toast.success('Equipment updated');
        setShowEditModal(false);
        setEditingEquipment(null);
        fetchEquipment();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update equipment');
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign equipment to current user
  const handleAssignToMe = async (id: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to use equipment");
      return;
    }

    setIsUpdating(id);
    try {
      const res = await apiFetch(`/api/equipment/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignToUserId: user.id }),
      });

      if (res.ok) {
        toast.success("Equipment marked as In Use");
        fetchEquipment();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to assign equipment");
      }
    } catch (error) {
      console.error("Assign error:", error);
      toast.error("Failed to assign equipment");
    } finally {
      setIsUpdating(null);
    }
  };

  // Release equipment
  const handleRelease = async (id: string) => {
    setIsUpdating(id);
    try {
      const res = await apiFetch(`/api/equipment/${id}/release`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success("Equipment marked as Available");
        fetchEquipment();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to release equipment");
      }
    } catch (error) {
      console.error("Release error:", error);
      toast.error("Failed to release equipment");
    } finally {
      setIsUpdating(null);
    }
  };

  // Generate auto name based on type and count
  const generateAutoName = (type: string) => {
    const typeConfig = EQUIPMENT_TYPES.find(t => t.type === type);
    const existingCount = groupedEquipment[type]?.length || 0;
    const num = String(existingCount + 1).padStart(2, '0');
    return `${typeConfig?.label || type} #${num}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Standardized Hero Banner */}
      <DashboardBanner 
        imageSrc={image.src} 
        alt="Warehouse Logistics" 
        objectFit="contain"
        className="mb-6 bg-gray-50/30"
      />

      {/* Equipment List Section */}
      <section className="px-4 md:px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="mb-6 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-medium text-black">
              EQUIPMENT LIST
            </h1>
            <div className="w-40 h-1 bg-black rounded-full mt-1" />
          </div>

          <div className="flex-1 max-w-md relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#296341] transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by name or identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm font-medium outline-none focus:bg-white focus:border-[#296341] focus:ring-4 focus:ring-[#296341]/10 transition-all shadow-sm"
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
        </div>

        {/* Loading State */}
        {isLoading || authLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#296341]" />
          </div>
        ) : (
          /* Equipment Categories */
          <div className="space-y-4">
            {EQUIPMENT_TYPES.map((config) => (
              <EquipmentCategory
                key={config.type}
                config={config}
                items={groupedEquipment[config.type] || []}
                expanded={expandedCategory === config.type}
                onToggle={() => toggleCategory(config.type)}
                onDelete={handleDeleteEquipment}
                onEdit={handleEditEquipment}
                onAssignToMe={handleAssignToMe}
                onRelease={handleRelease}
                isUpdating={isUpdating}
                user={user}
              />
            ))}
          </div>
        )}
      </section>

      {/* Add New Equipment Section */}
      <section className="bg-[#c2d9d1] mt-8 py-6 px-4 md:px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Toggle Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#296341] text-white font-semibold px-6 py-3 rounded-2xl text-sm md:text-base hover:bg-[#1e4a2e] transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              ADD NEW EQUIPMENT
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Location Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#296341]" />
                    Location
                  </label>
                  <select
                    value={newEquipment.locationCode}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, locationCode: e.target.value }))}
                    className="w-full h-[45px] bg-[#e5ebf3] rounded-md px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#296341] appearance-none"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.code}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#296341]" />
                    Equipment Type
                  </label>
                  <select
                    value={newEquipment.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      setNewEquipment(prev => ({ 
                        ...prev, 
                        type,
                        name: generateAutoName(type)
                      }));
                    }}
                    className="w-full h-[45px] bg-[#e5ebf3] rounded-md px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#296341] appearance-none"
                  >
                    {EQUIPMENT_TYPES.map(type => (
                      <option key={type.type} value={type.type}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., CHASSIS #01"
                    className="w-full h-[45px] bg-[#e5ebf3] rounded-md px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>

                {/* Identifier Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Identifier / Serial No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEquipment.identifier}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder="e.g., #10057"
                    className="w-full h-[45px] bg-[#e5ebf3] rounded-md px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#296341]"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-8 py-2 rounded-full text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEquipment}
                  disabled={isSubmitting}
                  className="bg-[#132540] text-white font-semibold px-8 py-2 rounded-full text-sm hover:bg-[#1a3254] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  ADD
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Summary Stats */}
      <section className="px-4 md:px-6 py-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {EQUIPMENT_TYPES.map((config) => {
            const items = groupedEquipment[config.type] || [];
            const available = items.filter(i => i.status === 'AVAILABLE').length;
            return (
              <div key={config.type} className={`${config.bgColor} rounded-xl p-4 text-center`}>
                <div className="flex justify-center mb-2">
                  {getEquipmentIcon(config.icon)}
                </div>
                <p className="text-sm font-medium text-gray-700">{config.label}</p>
                <p className="text-2xl font-bold text-[#296341]">{items.length}</p>
                <p className="text-xs text-gray-500">{available} available</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-8 bg-white" />

      {/* Edit Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[500px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#296341]">Edit Equipment</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEquipment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Equipment Name</label>
                <input
                  type="text"
                  value={editingEquipment.name}
                  onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full h-[45px] border border-gray-200 rounded-lg px-4 outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Identifier</label>
                <input
                  type="text"
                  value={editingEquipment.identifier || ''}
                  onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, identifier: e.target.value } : null)}
                  className="w-full h-[45px] border border-gray-200 rounded-lg px-4 outline-none focus:ring-2 focus:ring-[#296341]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Location</label>
                <select
                  value={editingEquipment.location.code}
                  onChange={(e) => setEditingEquipment(prev => prev ? { 
                    ...prev, 
                    location: { ...prev.location, code: e.target.value, name: locations.find(l => l.code === e.target.value)?.name || e.target.value }
                  } : null)}
                  className="w-full h-[45px] border border-gray-200 rounded-lg px-4 outline-none focus:ring-2 focus:ring-[#296341] appearance-none"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.code}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEquipment(null);
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-lg bg-[#296341] text-white font-semibold hover:bg-[#1e4a2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}