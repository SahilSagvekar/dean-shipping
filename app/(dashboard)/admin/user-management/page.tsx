'use client'

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import imgLogo from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import imgUserManagementIcon from "@/app/assets/a961317a5944ebd34013fff0b9659f00f55e3f7c.png";
import imgIdCard from "@/app/assets/10ad04e365367f2edb1a23ad5021caa2d9bfde6f.png";
import { useAuth } from "@/lib/auth-context";

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  role: "USER" | "AGENT" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
  _count?: {
    cargoBookings: number;
    passengerBookings: number;
    invoices: number;
  };
}

export default function UserManagement() {
  const { user: currentUser, apiFetch } = useAuth();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
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

  // Fetch users
  const fetchUsers = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    setError("");
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await apiFetch(`/api/users?role=USER&limit=10&page=${page}${searchParam}`);
      const data = await res.json();
      
      if (res.ok) {
        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } else {
        setError(data.error || "Failed to fetch users");
        setUsers([]);
      }
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and search
  useEffect(() => {
    fetchUsers(1, debouncedSearch);
  }, [debouncedSearch, apiFetch]);

  // Toggle expanded user
  const toggleUser = (id: string) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  // Handle delete
  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${userName}?`)) return;

    try {
      const res = await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to deactivate user");
        return;
      }

      // Refresh list
      const currentPage = users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      fetchUsers(currentPage, debouncedSearch);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Page navigation
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUsers(page, debouncedSearch);
  };

  // Format phone
  const formatPhone = (countryCode: string, phone: string) => {
    return `${countryCode} ${phone}`;
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
          <div className="h-[5px] bg-[#296341] rounded-full w-[202px]" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 text-black" />
          <input
            type="text"
            placeholder="Search user name or email"
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
        {isLoading && users.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-[#296341] rounded">
            <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-[24px]">No users found</p>
            {searchQuery && (
              <p className="text-[18px] mt-2">Try a different search term</p>
            )}
          </div>
        ) : (
          <>
            {/* Users List */}
            <div className="border border-[#296341]">
              {users.map((user, index) => (
                <div key={user.id}>
                  <div
                    className={`${
                      expandedUser === user.id
                        ? "border-[#296341] min-h-[250px]"
                        : "h-[65px]"
                    } border-b border-[#296341] relative`}
                  >
                    {/* User Row */}
                    <div className="flex items-center px-8 py-4 h-[65px]">
                      <div className="w-[50px] text-[28px]">
                        {(pagination.page - 1) * pagination.limit + index + 1}.
                      </div>
                      <div className="w-[280px] text-[28px] truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="w-[380px] text-[28px] truncate">
                        {user.email}
                      </div>
                      <div className="w-[250px] text-[28px]">
                        {formatPhone(user.countryCode, user.mobileNumber)}
                      </div>
                      <div className="flex-1" />
                      <button
                        onClick={() => toggleUser(user.id)}
                        className="p-2 hover:bg-gray-100 rounded mr-4"
                      >
                        {expandedUser === user.id ? (
                          <ChevronUp className="w-9 h-9 text-[#296341]" />
                        ) : (
                          <ChevronDown className="w-9 h-9 text-[#296341]" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                        className="p-2 hover:bg-red-50 rounded group"
                      >
                        <Trash2 className="w-10 h-10 text-[#296341] group-hover:text-red-500" />
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {expandedUser === user.id && (
                      <div className="px-8 pb-6 pt-2">
                        <div className="flex items-start gap-6">
                          {/* Large ID Card / Avatar */}
                          <div className="border border-[#296341] rounded-[10px] overflow-hidden bg-gray-50">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt="User Avatar"
                                className="w-[272px] h-[142px] object-cover"
                              />
                            ) : (
                              <div className="w-[272px] h-[142px] flex items-center justify-center">
                                <UserIcon className="w-16 h-16 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Small ID Cards */}
                          <div className="flex flex-col gap-2">
                            <div className="border border-[#296341] rounded-[10px] overflow-hidden">
                              <img
                                src={imgIdCard.src}
                                alt="ID Card"
                                className="w-[92px] h-[64px] object-cover"
                              />
                            </div>
                            <div className="border border-[#296341] rounded-[10px] overflow-hidden">
                              <img
                                src={imgIdCard.src}
                                alt="ID Card"
                                className="w-[92px] h-[64px] object-cover"
                              />
                            </div>
                          </div>

                          {/* User Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-[14px] font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-[16px] text-gray-500">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-[24px]">
                              <span className="text-gray-500">Email:</span> {user.email}
                            </p>
                            <p className="text-[24px]">
                              <span className="text-gray-500">Phone:</span> {formatPhone(user.countryCode, user.mobileNumber)}
                            </p>
                            
                            {/* Booking Stats */}
                            {user._count && (
                              <div className="flex gap-8 mt-4 pt-4 border-t border-gray-200">
                                <div className="text-center">
                                  <p className="text-[28px] font-bold text-[#296341]">
                                    {user._count.cargoBookings}
                                  </p>
                                  <p className="text-[14px] text-gray-500">Cargo</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[28px] font-bold text-[#296341]">
                                    {user._count.passengerBookings}
                                  </p>
                                  <p className="text-[14px] text-gray-500">Passenger</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[28px] font-bold text-[#296341]">
                                    {user._count.invoices}
                                  </p>
                                  <p className="text-[14px] text-gray-500">Invoices</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Info & Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-[20px] text-[#3b3b3b]">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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