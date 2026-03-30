'use client'

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
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
      <div className="flex justify-center mb-12">
        <img
          src={imgUserManagementIcon.src}
          alt="User Management"
          className="h-[200px] w-auto"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-8 flex-1 w-full">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[40px] font-medium text-[#296341] mb-2">
            USER MANAGEMENT
          </h1>
          <p className="text-[18px] text-gray-600 mb-2">Passenger Booking Records</p>
          <div className="h-[5px] bg-[#296341] rounded-full w-[202px]" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 text-black" />
          <input
            type="text"
            placeholder="Search passenger name, email, or invoice number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded pl-14 pr-4 py-3 text-[20px]"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#296341] animate-spin" />
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && passengers.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
          </div>
        ) : passengers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-[#296341] rounded">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-[24px]">No passenger bookings found</p>
            {searchQuery && (
              <p className="text-[18px] mt-2">Try a different search term</p>
            )}
          </div>
        ) : (
          <>
            {/* Passengers List */}
            <div className="border border-[#296341]">
              {passengers.map((passenger, index) => (
                <div key={passenger.id}>
                  <div
                    className={`${
                      expandedPassenger === passenger.id
                        ? "border-[#296341]"
                        : "h-[65px]"
                    } border-b border-[#296341] relative`}
                  >
                    {/* Passenger Row */}
                    <div className="flex items-center px-8 py-4 h-[65px]">
                      <div className="w-[50px] text-[28px]">
                        {(pagination.page - 1) * pagination.limit + index + 1}.
                      </div>
                      <div className="w-[250px] text-[28px] truncate">
                        {passenger.name}
                      </div>
                      <div className="w-[150px] text-[20px] truncate">
                        {passenger.invoiceNo}
                      </div>
                      <div className="w-[180px] text-[20px] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {passenger.fromLocation} → {passenger.toLocation}
                      </div>
                      <div className="w-[120px] text-[20px] flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {getTotalPassengers(passenger)} pax
                      </div>
                      <div className="w-[100px]">
                        <PaymentBadge status={passenger.paymentStatus} />
                      </div>
                      <div className="flex-1" />
                      <button
                        onClick={() => togglePassenger(passenger.id)}
                        className="p-2 hover:bg-gray-100 rounded mr-4"
                      >
                        {expandedPassenger === passenger.id ? (
                          <ChevronUp className="w-9 h-9 text-[#296341]" />
                        ) : (
                          <ChevronDown className="w-9 h-9 text-[#296341]" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(passenger.id, passenger.name)}
                        className="p-2 hover:bg-red-50 rounded group"
                      >
                        <Trash2 className="w-10 h-10 text-[#296341] group-hover:text-red-500" />
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {expandedPassenger === passenger.id && (
                      <div className="px-8 pb-6 pt-4">
                        <div className="flex items-start gap-8">
                          {/* ID Documents / Images */}
                          <div className="flex flex-col gap-3">
                            {passenger.images && passenger.images.length > 0 ? (
                              passenger.images.slice(0, 2).map((img, imgIdx) => (
                                <div key={img.id} className="border border-[#296341] rounded-[10px] overflow-hidden bg-gray-50">
                                  <img
                                    src={img.imageUrl}
                                    alt={img.caption || `Document ${imgIdx + 1}`}
                                    className="w-[180px] h-[100px] object-cover"
                                  />
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="border border-[#296341] rounded-[10px] overflow-hidden">
                                  <img
                                    src={imgIdCard.src}
                                    alt="ID Card"
                                    className="w-[180px] h-[100px] object-cover"
                                  />
                                </div>
                                <div className="border border-[#296341] rounded-[10px] overflow-hidden bg-gray-50 w-[180px] h-[100px] flex items-center justify-center">
                                  <FileText className="w-10 h-10 text-gray-300" />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <PaymentBadge status={passenger.paymentStatus} />
                                <span className="text-[14px] text-gray-500">
                                  Booked: {formatDate(passenger.createdAt)}
                                </span>
                              </div>
                              
                              <p className="text-[20px]">
                                <span className="text-gray-500">Email:</span> {passenger.email || "N/A"}
                              </p>
                              <p className="text-[20px]">
                                <span className="text-gray-500">Contact:</span> {passenger.contact || "N/A"}
                              </p>
                              <p className="text-[20px]">
                                <span className="text-gray-500">ID Type:</span> {passenger.idType}
                              </p>
                              <p className="text-[20px]">
                                <span className="text-gray-500">Travel Date:</span> {formatDate(passenger.bookingDate)}
                              </p>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                              <p className="text-[20px]">
                                <span className="text-gray-500">Route:</span> {passenger.fromLocation} → {passenger.toLocation}
                              </p>
                              
                              {/* Passenger Breakdown */}
                              <div className="flex gap-6 py-2">
                                {passenger.adultCount > 0 && (
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-[#296341]" />
                                    <span className="text-[18px]">{passenger.adultCount} Adult{passenger.adultCount > 1 ? "s" : ""}</span>
                                  </div>
                                )}
                                {passenger.childCount > 0 && (
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-blue-500" />
                                    <span className="text-[18px]">{passenger.childCount} Child{passenger.childCount > 1 ? "ren" : ""}</span>
                                  </div>
                                )}
                                {passenger.infantCount > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Baby className="w-5 h-5 text-pink-500" />
                                    <span className="text-[18px]">{passenger.infantCount} Infant{passenger.infantCount > 1 ? "s" : ""}</span>
                                  </div>
                                )}
                              </div>

                              {/* Luggage */}
                              {passenger.luggage && passenger.luggage.length > 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                  <p className="text-[16px] text-gray-500 mb-2 flex items-center gap-2">
                                    <Luggage className="w-4 h-4" /> Luggage
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {passenger.luggage.map((lug) => (
                                      <span key={lug.id} className="px-2 py-1 bg-gray-100 rounded text-[14px]">
                                        {lug.quantity}x {lug.type} ({lug.weight}kg)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div className="w-[200px] bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-[14px] text-gray-500 mb-3 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" /> Payment
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[16px]">
                                <span className="text-gray-500">Subtotal:</span>
                                <span>{formatCurrency(passenger.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-[16px]">
                                <span className="text-gray-500">VAT ({passenger.vatPercent}%):</span>
                                <span>{formatCurrency(passenger.vatAmount)}</span>
                              </div>
                              <div className="flex justify-between text-[20px] font-bold text-[#296341] pt-2 border-t border-gray-300">
                                <span>Total:</span>
                                <span>{formatCurrency(passenger.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Remark */}
                        {passenger.remark && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-[16px] text-gray-500">Remark:</p>
                            <p className="text-[18px]">{passenger.remark}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Info & Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-[20px] text-[#3b3b3b]">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
              </p>
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1 || isLoading}
                    className="px-4 py-2 rounded-md border border-[#296341] text-[#296341] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#296341] hover:text-white transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
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
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || isLoading}
                    className="px-4 py-2 rounded-md border border-[#296341] text-[#296341] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#296341] hover:text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={imgLogo.src}
              alt="Dean's Shipping Ltd"
              className="h-[94px]"
            />
          </div>
          <div className="text-white text-[40px] font-semibold">
            {currentUser?.role || "Administration"} |{" "}
            <span className="font-normal">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Guest"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}