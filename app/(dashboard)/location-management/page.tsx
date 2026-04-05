"use client"

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Loader2, X, Check, Save, AlertCircle, Search } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgHero from "@/app/assets/b493fe526d34a8d0e654480300ff88ab45d2dde1.png";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface Location {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    _count?: {
        equipmentAt: number;
        voyagesFrom?: number;
        voyagesTo?: number;
    };
}

export default function LocationManagement() {
    const { user, apiFetch } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
    });

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/api/locations");
            const data = await res.json();
            if (res.ok) {
                setLocations(data.locations || []);
            } else {
                toast.error(data.error || "Failed to fetch locations");
            }
        } catch (err) {
            toast.error("An error occurred while fetching locations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [apiFetch]);

    const handleCreateLocation = async () => {
        if (!formData.code || !formData.name) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiFetch("/api/locations", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Location added successfully");
                setFormData({ code: "", name: "" });
                setIsAddModalOpen(false);
                fetchLocations();
            } else {
                toast.error(data.error || "Failed to add location");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateLocation = async (id: string, updates: Partial<Location>) => {
        try {
            const res = await apiFetch(`/api/locations/${id}`, {
                method: "PATCH",
                body: JSON.stringify(updates),
            });

            if (res.ok) {
                toast.success("Location updated successfully");
                fetchLocations();
                setEditingLocation(null);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update location");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this location? It may affect existing routes and bookings.")) return;

        try {
            const res = await apiFetch(`/api/locations/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Location deactivated");
                fetchLocations();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to deactivate location");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex justify-center mb-6 lg:mb-12 px-4 lg:px-8 pt-4 lg:pt-8">
                <div className="relative w-full max-w-[1000px] aspect-[1000/400] overflow-hidden rounded-xl shadow-lg">
                    <img
                        src={imgHero.src}
                        alt="Location Management"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-6 lg:bottom-8 lg:left-12">
                        <h1 className="text-white text-[28px] lg:text-[48px] font-bold tracking-tight">PORT & LOCATION</h1>
                        <h2 className="text-white/90 text-[14px] lg:text-[24px] font-medium uppercase tracking-[0.2em]">Management System</h2>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12 w-full flex-1">
                {/* Header Action Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12">
                    <div className="text-center lg:text-left">
                        <h2 className="text-[28px] lg:text-[36px] font-bold text-black mb-1 flex items-center justify-center lg:justify-start gap-3">
                            <MapPin className="w-8 h-8 lg:w-10 lg:h-10 text-[#296341]" />
                            LOCATION LIST
                        </h2>
                        <div className="h-[4px] bg-[#296341] w-[150px] lg:w-[220px] mx-auto lg:mx-0" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative w-full sm:w-[350px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#296341] outline-none transition-all text-base lg:text-lg"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#296341] text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-[#1e4a2e] transition-all shadow-md active:scale-95"
                        >
                            <Plus className="w-6 h-6" />
                            Add New
                        </button>
                    </div>
                </div>

                {/* Locations Table with Scroll for Mobile */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-[#132540] text-white">
                                <tr>
                                    <th className="px-8 py-4 lg:py-5 text-[16px] lg:text-[18px] font-semibold uppercase tracking-wider">Code</th>
                                    <th className="px-8 py-4 lg:py-5 text-[16px] lg:text-[18px] font-semibold uppercase tracking-wider">Location Name</th>
                                    <th className="px-8 py-4 lg:py-5 text-[16px] lg:text-[18px] font-semibold uppercase tracking-wider text-center">Equipment</th>
                                    <th className="px-8 py-4 lg:py-5 text-[16px] lg:text-[18px] font-semibold uppercase tracking-wider text-center">Status</th>
                                    <th className="px-8 py-4 lg:py-5 text-[16px] lg:text-[18px] font-semibold uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 lg:py-20 text-center">
                                            <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 animate-spin text-[#296341] mx-auto" />
                                            <p className="mt-4 text-gray-500 font-medium">Loading locations...</p>
                                        </td>
                                    </tr>
                                ) : filteredLocations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 lg:py-20 text-center text-gray-400 italic">
                                            No locations found. Start by adding one.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLocations.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-4 lg:py-6">
                                                <span className="bg-[#e5f7f1] text-[#296341] px-3 py-1 rounded-md font-bold text-base lg:text-lg">
                                                    {loc.code}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 lg:py-6">
                                                <span className="text-[18px] lg:text-[20px] font-semibold text-[#132540]">
                                                    {loc.name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 lg:py-6 text-center">
                                                <span className="text-gray-600 font-medium text-sm lg:text-base">
                                                    {loc._count?.equipmentAt || 0} items
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 lg:py-6">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleUpdateLocation(loc.id, { isActive: !loc.isActive })}
                                                        className={`flex items-center gap-2 px-4 py-1 lg:py-1.5 rounded-full text-[12px] lg:text-sm font-bold transition-all
                                                            ${loc.isActive
                                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                                : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                                                    >
                                                        {loc.isActive ? (
                                                            <><Check className="w-4 h-4" /> Active</>
                                                        ) : (
                                                            <><X className="w-4 h-4" /> Inactive</>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 lg:py-6 text-right">
                                                <div className="flex justify-end gap-1 lg:gap-3 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingLocation(loc)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-5 h-5 lg:w-6 lg:h-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLocation(loc.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5 lg:w-6 lg:h-6" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Add/Edit Modal - Full height on mobile */}
            {(isAddModalOpen || editingLocation) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 lg:p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto lg:overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className={`p-5 lg:p-6 flex items-center justify-between text-white sticky top-0 z-10 ${editingLocation ? "bg-[#132540]" : "bg-[#296341]"}`}>
                            <h3 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                                {editingLocation ? <Edit2 className="w-5 h-5 lg:w-6 lg:h-6" /> : <Plus className="w-5 h-5 lg:w-6 lg:h-6" />}
                                {editingLocation ? "Edit Location" : "Add New Location"}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingLocation(null);
                                    setFormData({ code: "", name: "" });
                                }}
                                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 lg:w-7 lg:h-7" />
                            </button>
                        </div>

                        <div className="p-6 lg:p-8 space-y-6">
                            <div>
                                <label className="block text-base lg:text-[18px] font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    Location Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., NAS, GTC"
                                    maxLength={10}
                                    value={editingLocation ? editingLocation.code : formData.code}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        if (editingLocation) {
                                            setEditingLocation({ ...editingLocation, code: val });
                                        } else {
                                            setFormData({ ...formData, code: val });
                                        }
                                    }}
                                    className="w-full px-4 lg:px-5 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-[#296341] focus:bg-white outline-none transition-all text-lg lg:text-xl font-bold text-[#132540]"
                                />
                                <p className="mt-2 text-xs lg:text-sm text-gray-400">Short identifier used for manifests and schedules.</p>
                            </div>

                            <div>
                                <label className="block text-base lg:text-[18px] font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Nassau, Green Turtle Cay"
                                    value={editingLocation ? editingLocation.name : formData.name}
                                    onChange={(e) => {
                                        if (editingLocation) {
                                            setEditingLocation({ ...editingLocation, name: e.target.value });
                                        } else {
                                            setFormData({ ...formData, name: e.target.value });
                                        }
                                    }}
                                    className="w-full px-4 lg:px-5 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-[#296341] focus:bg-white outline-none transition-all text-lg lg:text-xl font-semibold text-[#132540]"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingLocation(null);
                                    }}
                                    className="flex-1 px-8 py-3 lg:py-4 border-2 border-gray-100 rounded-xl text-base lg:text-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingLocation ? () => handleUpdateLocation(editingLocation.id, { code: editingLocation.code, name: editingLocation.name }) : handleCreateLocation}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#132540] text-white px-8 py-3 lg:py-4 rounded-xl text-base lg:text-lg font-bold flex items-center justify-center gap-2 hover:bg-[#1a3254] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {editingLocation ? "Update Location" : "Save Location"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Brand Footer */}
            <footer className="bg-[#296341] py-6 lg:py-8 mt-auto">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[50px] lg:h-[70px]" />
                    </div>
                    <div className="text-white text-[18px] lg:text-[28px] font-semibold text-center lg:text-right">
                        {user?.role || "Administration"} | <span className="font-normal">{user ? `${user.firstName} ${user.lastName}` : "Cecily Dean"}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
