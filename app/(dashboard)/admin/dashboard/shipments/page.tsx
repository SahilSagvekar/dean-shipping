"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Printer,
  Package,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const TYPES = ["DRY", "FROZEN", "COOLER"] as const;
const STATUSES = ["ALL", "PAID", "UNPAID", "PARTIAL"] as const;
const PER_PAGE = 20;

export default function ShipmentsPage() {
  const { apiFetch } = useAuth();
  const searchParams = useSearchParams();

  const initialType = searchParams.get("type")?.toUpperCase() || "DRY";

  const [activeType, setActiveType] = useState(initialType);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PER_PAGE,
    total: 0,
    totalPages: 0,
  });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PER_PAGE),
        type: activeType,
      });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await apiFetch(`/api/bookings/cargo?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setPagination(
          data.pagination || { page: 1, limit: PER_PAGE, total: 0, totalPages: 0 }
        );
      }
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, activeType, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeType, statusFilter]);

  // Client-side search on current page results
  const filtered = searchQuery
    ? bookings.filter((b) => {
        const q = searchQuery.toLowerCase();
        const sender = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.toLowerCase();
        const receiver = (b.contactName || "").toLowerCase();
        const invoice = (b.invoiceNo || "").toLowerCase();
        return sender.includes(q) || receiver.includes(q) || invoice.includes(q);
      })
    : bookings;

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/dashboard"
            className="w-10 h-10 lg:w-12 lg:h-12 bg-[#296341] flex items-center justify-center text-white hover:bg-[#1e4c30] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-[36px] font-black text-[#296341] italic tracking-tighter">
              ALL SHIPMENTS
            </h1>
            <p className="text-xs lg:text-[14px] text-gray-400 font-bold uppercase tracking-widest">
              {activeType} cargo bookings
            </p>
          </div>
        </div>

        {/* Type Tabs + Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Type Tabs */}
          <div className="bg-gray-100 p-1.5 flex items-center gap-1 shadow-inner">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-6 py-2 text-sm font-black uppercase tracking-widest transition-all ${
                  activeType === type
                    ? "bg-[#296341] text-white shadow-lg shadow-[#296341]/30 -translate-y-0.5"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoice, sender, receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border-2 border-gray-200 text-sm font-bold focus:border-[#296341] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-100 p-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    statusFilter === s
                      ? "bg-[#296341] text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-gray-400 font-bold">
            {pagination.total} total shipment{pagination.total !== 1 ? "s" : ""}{" "}
            &middot; Page {pagination.page} of {pagination.totalPages || 1}
          </p>
          <button
            onClick={() => window.print()}
            className="p-2 text-[#296341] hover:bg-[#296341]/10 transition-colors active:scale-95"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#296341] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#296341] text-sm font-black tracking-widest italic animate-pulse">
                LOADING...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <Package className="w-16 h-16 mb-4" />
            <p className="text-lg font-black italic tracking-widest uppercase">
              No {activeType.toLowerCase()} shipments found
            </p>
            {searchQuery && (
              <p className="text-sm font-bold text-gray-400 mt-2">
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block border border-[#296341] overflow-hidden">
              <div className="bg-[#d4e0d9] border-b border-[#296341] px-4 py-3 grid grid-cols-[100px_140px_140px_1fr_120px_100px_100px_160px] gap-4">
                <div className="font-bold text-[14px]">Invoice</div>
                <div className="font-bold text-[14px]">Sender</div>
                <div className="font-bold text-[14px]">Receiver</div>
                <div className="font-bold text-[14px]">Item Details</div>
                <div className="font-bold text-[14px]">Payment</div>
                <div className="font-bold text-[14px]">Amount</div>
                <div className="font-bold text-[14px]">Status</div>
                <div className="font-bold text-[14px]">Date</div>
              </div>

              <div>
                {filtered.map((shipment: any, idx: number) => {
                  const invoiceNo = shipment.invoiceNo || "N/A";
                  const sender = shipment.user
                    ? `${shipment.user.firstName} ${shipment.user.lastName}`
                    : shipment.contactName || "N/A";
                  const receiver = shipment.contactName || "N/A";
                  const itemsStr =
                    shipment.items?.map((i: any) => i.itemType).join(", ") ||
                    "N/A";
                  const paymentMode =
                    shipment.invoice?.paymentMode || "---";
                  const amount = `$${(shipment.totalAmount || 0).toLocaleString()}`;
                  const status = shipment.paymentStatus || "UNPAID";
                  const isPaid = status === "PAID";
                  const date = shipment.createdAt
                    ? new Date(shipment.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";

                  return (
                    <div key={shipment.id || idx}>
                      <div className="px-4 py-3 grid grid-cols-[100px_140px_140px_1fr_120px_100px_100px_160px] gap-4 items-center hover:bg-gray-50 transition-colors">
                        <div className="text-[14px] font-black italic text-[#296341]">
                          #{invoiceNo}
                        </div>
                        <div className="text-[14px] font-bold truncate">
                          {sender}
                        </div>
                        <div className="text-[14px] font-bold truncate">
                          {receiver}
                        </div>
                        <div className="text-[14px] font-medium truncate text-gray-600">
                          {itemsStr}
                        </div>
                        <div className="text-[14px] font-medium">
                          {paymentMode}
                        </div>
                        <div className="text-[14px] font-black">{amount}</div>
                        <div>
                          <span
                            className={`inline-block border-2 border-black px-2 py-0.5 text-[10px] font-black tracking-widest uppercase ${
                              isPaid ? "text-[#70cf5d]" : "text-[#cf5d5d]"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="text-[14px] font-medium text-gray-400">
                          {date}
                        </div>
                      </div>
                      {idx < filtered.length - 1 && (
                        <div className="border-t border-[#d4e0d9]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((shipment: any, idx: number) => {
                const invoiceNo = shipment.invoiceNo || "N/A";
                const sender = shipment.user
                  ? `${shipment.user.firstName} ${shipment.user.lastName}`
                  : shipment.contactName || "N/A";
                const receiver = shipment.contactName || "N/A";
                const itemsStr =
                  shipment.items?.map((i: any) => i.itemType).join(", ") ||
                  "N/A";
                const paymentMode =
                  shipment.invoice?.paymentMode || "---";
                const amount = `$${(shipment.totalAmount || 0).toLocaleString()}`;
                const status = shipment.paymentStatus || "UNPAID";
                const isPaid = status === "PAID";
                const date = shipment.createdAt
                  ? new Date(shipment.createdAt).toLocaleDateString()
                  : "N/A";

                return (
                  <div
                    key={shipment.id || idx}
                    className="bg-white border border-gray-100 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#296341] text-white px-3 py-1 text-sm font-black italic">
                          #{invoiceNo}
                        </div>
                        <div
                          className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border ${
                            isPaid
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-red-100 text-red-600 bg-red-50"
                          }`}
                        >
                          {status}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                        {date}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                          Sender
                        </p>
                        <p className="text-[13px] font-bold text-gray-800 truncate">
                          {sender}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">
                          Receiver
                        </p>
                        <p className="text-[13px] font-bold text-gray-800 truncate">
                          {receiver}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-gray-400 font-black uppercase">
                          {paymentMode}
                        </span>
                        <span className="text-[16px] font-black text-[#296341]">
                          {amount}
                        </span>
                      </div>
                      <p className="text-[12px] font-bold text-gray-500 truncate">
                        {itemsStr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#296341] text-[#296341] font-black text-sm uppercase tracking-widest hover:bg-[#296341] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(pagination.totalPages, 5) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 text-sm font-black transition-all ${
                            page === pageNum
                              ? "bg-[#296341] text-white"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <span className="sm:hidden text-sm font-black text-gray-500">
                  {page} / {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#296341] text-[#296341] font-black text-sm uppercase tracking-widest hover:bg-[#296341] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}