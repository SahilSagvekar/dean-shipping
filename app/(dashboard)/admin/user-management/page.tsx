'use client'

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  User as UserIcon,
  Users,
  Baby,
  UserCheck,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Luggage,
  AlertCircle,
} from "lucide-react";
import imgLogo from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import imgUserManagementIcon from "@/app/assets/a961317a5944ebd34013fff0b9659f00f55e3f7c.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import { useAuth } from "@/lib/auth-context";

// Types for Passenger Booking
interface PassengerLuggage {
  id: string;
  type: string;
  weight: number;
  quantity: number;
  price: number;
}

interface BookingImage {
  id: string;
  imageUrl: string;
  imageType: string;
  caption?: string;
}

interface PassengerBooking {
  id: string;
  invoiceNo: string;
  name: string;
  email: string;
  contact: string;
  infantCount: number;
  childCount: number;
  adultCount: number;
  bookingDate: string;
  fromLocation: string;
  toLocation: string;
  idType: string;
  paymentStatus: "PAID" | "UNPAID" | "PARTIAL";
  totalAmount: number;
  vatPercent: number;
  vatAmount: number;
  subtotal: number;
  remark?: string;
  voyageId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  images: BookingImage[];
  luggage: PassengerLuggage[];
  invoice?: {
    id: string;
    invoiceNo: string;
    paymentStatus: string;
    paidAmount: number;
  };
  _count?: {
    images: number;
    luggage: number;
  };
}

export default function UserManagement() {
  const { user: currentUser, apiFetch } = useAuth();
  
  // State
  const [passengers, setPassengers] = useState<PassengerBooking[]>([]);
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch passenger bookings
  const fetchPassengers = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    setError("");
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await apiFetch(`/api/bookings/passenger?limit=10&page=${page}${searchParam}`);
      const data = await res.json();
      
      if (res.ok) {
        setPassengers(data.bookings || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } else {
        setError(data.error || "Failed to fetch passenger bookings");
        setPassengers([]);
      }
    } catch (err: any) {
      setError(err.message);
      setPassengers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and search
  useEffect(() => {
    fetchPassengers(1, debouncedSearch);
  }, [debouncedSearch, apiFetch]);

  // Toggle expanded passenger
  const togglePassenger = (id: string) => {
    setExpandedPassenger(expandedPassenger === id ? null : id);
  };

  // Handle delete
  const handleDelete = async (bookingId: string, passengerName: string) => {
    if (!confirm(`Are you sure you want to delete booking for ${passengerName}?`)) return;

    try {
      const res = await apiFetch(`/api/bookings/passenger/${bookingId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete booking");
        return;
      }

      // Refresh list
      const currentPage = passengers.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      fetchPassengers(currentPage, debouncedSearch);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Page navigation
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPassengers(page, debouncedSearch);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BSD",
    }).format(amount);
  };

  // Get total passengers
  const getTotalPassengers = (booking: PassengerBooking) => {
    return booking.infantCount + booking.childCount + booking.adultCount;
  };

  // Payment status badge
  const PaymentBadge = ({ status }: { status: string }) => {
    const styles = {
      PAID: "bg-green-100 text-green-700",
      UNPAID: "bg-red-100 text-red-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[14px] font-medium ${styles[status as keyof typeof styles] || styles.UNPAID}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* User Management Icons */}
      <div className="flex justify-center mb-6 lg:mb-12 pt-4">
        <img
          src={imgUserManagementIcon.src}
          alt="User Management"
          className="h-[120px] md:h-[160px] lg:h-[200px] w-auto transition-all"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-8 flex-1 w-full">
        {/* Title */}
        <div className="mb-6 lg:mb-8 text-center lg:text-left">
          <h1 className="text-[32px] md:text-[40px] font-black text-[#296341] mb-2 italic tracking-tighter uppercase">
            USER MANAGEMENT
          </h1>
          <p className="text-[16px] md:text-[18px] text-gray-500 font-bold uppercase tracking-widest mb-2">Passenger Booking Records</p>
          <div className="h-[5px] bg-[#296341] rounded-full w-[150px] md:w-[202px] mx-auto lg:mx-0" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 lg:mb-8 shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 lg:w-7 lg:h-7 text-black" />
          <input
            type="text"
            placeholder="Search name, email, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-gray-100 focus:border-[#296341] rounded-[10px] pl-12 lg:pl-14 pr-4 py-3 lg:py-4 text-[18px] lg:text-[20px] font-medium outline-none transition-all placeholder:text-gray-300"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#296341] animate-spin" />
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-6 font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && passengers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 className="w-12 h-12 animate-spin text-[#296341] mb-4" />
            <p className="text-gray-400 font-black italic uppercase tracking-widest">Gathering Data</p>
          </div>
        ) : passengers.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[20px]">
            <Users className="w-16 h-16 mx-auto mb-4 text-[#296341] opacity-20" />
            <p className="text-[24px] font-black italic text-gray-300 uppercase italic">No records found</p>
          </div>
        ) : (
          <>
            {/* Passengers List */}
            <div className="overflow-hidden bg-white border border-gray-200 rounded-[15px] shadow-sm">
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="group transition-colors hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
                  <div className={`relative ${expandedPassenger === passenger.id ? "bg-white" : ""}`}>
                    {/* Passenger Row / Card Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center px-4 lg:px-8 py-4 lg:h-[65px] gap-3 lg:gap-0">
                      {/* Mobile Header: Index + Name + Status */}
                      <div className="flex items-center justify-between lg:contents">
                        <div className="flex items-center gap-3 lg:contents">
                          <div className="w-[35px] lg:w-[50px] text-[18px] lg:text-[28px] font-black text-gray-300 italic group-hover:text-[#296341] transition-colors tabular-nums">
                            {((pagination.page - 1) * pagination.limit + index + 1).toString().padStart(2, '0')}.
                          </div>
                          <div className="text-[20px] lg:text-[28px] font-black text-[#132540] truncate lg:w-[250px] uppercase tracking-tighter">
                            {passenger.name}
                          </div>
                        </div>
                        <div className="lg:hidden">
                           <PaymentBadge status={passenger.paymentStatus} />
                        </div>
                      </div>

                      {/* Details Row (Mobile: 2 cols, Desktop: contents) */}
                      <div className="grid grid-cols-2 lg:contents gap-2">
                        <div className="text-[14px] lg:text-[20px] font-bold text-gray-500 font-mono lg:w-[150px]">
                          {passenger.invoiceNo}
                        </div>
                        <div className="text-[14px] lg:text-[20px] font-bold text-gray-500 flex items-center gap-2 lg:w-[180px]">
                          <MapPin className="w-4 h-4 text-[#296341]" />
                          {passenger.fromLocation} → {passenger.toLocation}
                        </div>
                        <div className="text-[14px] lg:text-[20px] font-bold text-gray-500 flex items-center gap-2 lg:w-[120px]">
                          <Users className="w-4 h-4 text-[#296341]" />
                          {getTotalPassengers(passenger)} pax
                        </div>
                        <div className="hidden lg:block w-[100px]">
                          <PaymentBadge status={passenger.paymentStatus} />
                        </div>
                      </div>

                      <div className="flex-1" />
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 lg:gap-4 mt-2 lg:mt-0 pt-2 lg:pt-0 border-t lg:border-0 border-gray-100">
                        <button
                          onClick={() => togglePassenger(passenger.id)}
                          className="flex-1 lg:flex-none p-2 hover:bg-[#296341]/10 rounded-full transition-colors flex items-center justify-center lg:block"
                        >
                          {expandedPassenger === passenger.id ? (
                            <ChevronUp className="w-7 h-7 lg:w-9 lg:h-9 text-[#296341]" />
                          ) : (
                            <ChevronDown className="w-7 h-7 lg:w-9 lg:h-9 text-[#296341]" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(passenger.id, passenger.name)}
                          className="p-2 hover:bg-red-50 rounded-full group/del transition-colors"
                        >
                          <Trash2 className="w-7 h-7 lg:w-10 lg:h-10 text-gray-300 group-hover/del:text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedPassenger === passenger.id && (
                      <div className="px-4 lg:px-8 pb-8 pt-4 animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-t border-gray-50">
                        <div className="flex flex-col lg:flex-row items-start gap-8">
                          {/* ID Documents / Images */}
                          <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {passenger.images && passenger.images.length > 0 ? (
                              passenger.images.map((img, imgIdx) => (
                                <div key={img.id} className="relative flex-shrink-0 border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50 group/img">
                                  <img
                                    src={img.imageUrl}
                                    alt={img.caption || `Document ${imgIdx + 1}`}
                                    className="w-[140px] h-[80px] lg:w-[180px] lg:h-[100px] object-cover transition-transform group-hover/img:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <Search className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="border border-gray-100 rounded-xl overflow-hidden opacity-40">
                                  <img
                                    src={imgIdCard.src}
                                    alt="ID Placeholder"
                                    className="w-[140px] h-[80px] lg:w-[180px] lg:h-[100px] object-cover grayscale"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <PaymentBadge status={passenger.paymentStatus} />
                                </div>
                                <span className="text-[12px] font-black text-gray-300 uppercase tracking-widest tabular-nums">
                                  Ref: #{passenger.id.slice(-6)}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-[16px] lg:text-[20px] font-bold text-gray-700 flex items-center justify-between">
                                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Email</span> 
                                  <span className="truncate max-w-[200px]">{passenger.email || "N/A"}</span>
                                </p>
                                <p className="text-[16px] lg:text-[20px] font-bold text-gray-700 flex items-center justify-between">
                                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Contact</span> 
                                  <span>{passenger.contact || "N/A"}</span>
                                </p>
                                <p className="text-[16px] lg:text-[20px] font-bold text-gray-700 flex items-center justify-between">
                                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest">ID Type</span> 
                                  <span className="bg-gray-100 px-3 py-1 rounded-full text-[12px] uppercase">{passenger.idType}</span>
                                </p>
                                <p className="text-[16px] lg:text-[20px] font-bold text-[#296341] flex items-center justify-between">
                                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Travel Date</span> 
                                  <span>{formatDate(passenger.bookingDate)}</span>
                                </p>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                              <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Passenger Breakdown</label>
                                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                  {passenger.adultCount > 0 && (
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="w-5 h-5 text-[#296341]" />
                                      <span className="text-[16px] font-black text-[#132540]">{passenger.adultCount} ADULTS</span>
                                    </div>
                                  )}
                                  {passenger.childCount > 0 && (
                                    <div className="flex items-center gap-2">
                                      <UserIcon className="w-5 h-5 text-blue-500" />
                                      <span className="text-[16px] font-black text-[#132540]">{passenger.childCount} CHILDREN</span>
                                    </div>
                                  )}
                                  {passenger.infantCount > 0 && (
                                    <div className="flex items-center gap-2">
                                      <Baby className="w-5 h-5 text-pink-500" />
                                      <span className="text-[16px] font-black text-[#132540]">{passenger.infantCount} INFANTS</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Luggage Area */}
                              {passenger.luggage && passenger.luggage.length > 0 && (
                                <div className="space-y-2">
                                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Luggage className="w-4 h-4" /> Registered Luggage
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {passenger.luggage.map((lug) => (
                                      <span key={lug.id} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-black text-[#296341] shadow-sm">
                                        {lug.quantity}x {lug.type} ({lug.weight}kg)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div className="w-full lg:w-[250px] bg-[#132540] rounded-2xl p-6 shadow-xl shadow-blue-900/10 text-white transform lg:-translate-y-4">
                            <p className="text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" /> Billing Summary
                            </p>
                            <div className="space-y-3">
                              <div className="flex justify-between text-[14px]">
                                <span className="text-blue-200/50">Subtotal</span>
                                <span className="font-bold tabular-nums">{formatCurrency(passenger.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-[14px]">
                                <span className="text-blue-200/50">Tax ({passenger.vatPercent}%)</span>
                                <span className="font-bold tabular-nums">{formatCurrency(passenger.vatAmount)}</span>
                              </div>
                              <div className="pt-3 border-t border-white/10 mt-3">
                                <div className="flex justify-between text-[24px] font-black tabular-nums">
                                  <span className="text-xs uppercase tracking-tighter self-center text-blue-100">Total</span>
                                  <span>{formatCurrency(passenger.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {passenger.invoice && (
                              <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-blue-200/40 font-bold uppercase tracking-widest text-center">
                                PAID AMOUNT: {formatCurrency(passenger.invoice.paidAmount)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Remark */}
                        {passenger.remark && (
                          <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Administrative Remarks</p>
                            <p className="text-[16px] text-gray-600 italic font-medium leading-relaxed">&ldquo;{passenger.remark}&rdquo;</p>
                          </div>
                        )}
                        
                        <div className="mt-6 flex justify-end">
                           <button className="flex items-center gap-2 text-[12px] font-black uppercase tracking-tighter text-[#296341] hover:underline bg-gray-50 px-4 py-2 rounded-full transition-all active:scale-95">
                              View Full Manifest Entry <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-10">
              <p className="text-[16px] lg:text-[20px] font-black text-[#132540] italic opacity-40 uppercase tracking-tighter">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
              </p>
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1 || isLoading}
                    className="p-3 rounded-full border-2 border-gray-100 text-gray-400 disabled:opacity-20 hover:bg-[#296341] hover:text-white transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(pagination.totalPages, 3) }, (_, i) => {
                       // Logic to show a few pages around current
                       let p = pagination.page;
                       if (p === 1) p = 1;
                       else if (p === pagination.totalPages) p = Math.max(1, pagination.totalPages - 2);
                       else p = p - 1;
                       
                       const pageNum = Math.min(pagination.totalPages, p + i);
                       if (pageNum < 1) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          disabled={isLoading}
                          className={`w-10 h-10 rounded-full font-black text-[14px] transition-all transform active:scale-90 ${
                            pageNum === pagination.page
                              ? "bg-[#296341] text-white shadow-lg shadow-green-900/20"
                              : "bg-white border-2 border-gray-100 text-gray-400 hover:border-[#296341] hover:text-[#296341]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || isLoading}
                    className="p-3 rounded-full border-2 border-gray-100 text-gray-400 disabled:opacity-20 hover:bg-[#296341] hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modern High-End Footer */}
      <footer className="bg-[#132540] py-10 lg:py-16 mt-12 border-t-8 border-[#296341]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
              <div className="bg-white p-3 rounded-3xl shadow-2xl">
                <img
                  src={imgLogo.src}
                  alt="Dean's Shipping"
                  className="h-[60px] lg:h-[90px] w-auto"
                />
              </div>
              <div className="h-[60px] w-1 bg-white/10 rounded-full hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-white font-black text-2xl uppercase tracking-widest leading-none">DEAN&apos;S SHIPPING</p>
                <p className="text-blue-300/50 font-bold text-xs uppercase tracking-[0.4em] mt-1">Personnel Management</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center lg:items-end">
              <div className="text-white text-[24px] lg:text-[40px] font-black italic uppercase tracking-tighter leading-none mb-2">
                <span className="text-[#296341] opacity-50 not-italic mr-2">LOGGED AS</span>
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "GUEST ACCESS"}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[12px] font-black text-blue-200/30 uppercase tracking-[0.3em]">
                  SECURE PORTAL ACCESS • {currentUser?.role || "ADMIN"} PRIVILEGES
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}