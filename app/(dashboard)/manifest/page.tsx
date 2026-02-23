"use client";

import { useState, useEffect, useCallback } from "react";
import {
    MapPin,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Printer,
    ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import imgRectangle228 from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle2 from "@/app/assets/7bfea36700cced4af0de8d5f4074e11966bfadd9.png";

// ── Types ────────────────────────────────────────────────────────────────────

interface VoyageSummary {
    id: string;
    voyageNo: number;
    shipName: string;
    date: string;
    status: string;
    from: { code: string; name: string };
    to: { code: string; name: string };
    summary: {
        totalBookings: number;
        dry: number;
        frozen: number;
        cooler: number;
        totalAmount: number;
        paidAmount: number;
        unpaidAmount: number;
    };
}

interface CargoBooking {
    id: string;
    invoiceNo: string;
    user: { firstName: string; lastName: string };
    contactName: string;
    items: { itemType: string; quantity: number; total: number }[];
    invoice: { paymentMode: string | null; paymentStatus: string } | null;
    totalAmount: number;
    paymentStatus: string;
    updatedAt: string;
    type: string;
}

interface VoyageDetail {
    voyage: {
        id: string;
        voyageNo: number;
        shipName: string;
        date: string;
        status: string;
        from: { code: string; name: string };
        to: { code: string; name: string };
    };
    bookings: {
        dry: CargoBooking[];
        frozen: CargoBooking[];
        cooler: CargoBooking[];
    };
    summary: {
        totalBookings: number;
        dry: number;
        frozen: number;
        cooler: number;
        totalAmount: number;
        paidAmount: number;
        unpaidAmount: number;
    };
}

// ── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const isPaid = status === "PAID";
    return (
        <span
            className={`inline-flex items-center justify-center px-3 py-1 rounded text-sm font-semibold min-w-[70px] ${isPaid
                    ? "bg-green-100 text-green-600 border border-green-300"
                    : "bg-red-100 text-red-500 border border-red-300"
                }`}
        >
            {isPaid ? "Paid" : "Unpaid"}
        </span>
    );
}

// ── CargoTypeTable ────────────────────────────────────────────────────────────
// Renders one DRY / FROZEN / COOLER section table, matching the dashboard style.

const BADGE_COLOR: Record<string, string> = {
    DRY:    "bg-amber-500",
    FROZEN: "bg-blue-500",
    COOLER: "bg-cyan-500",
};

function CargoTypeTable({
    title,
    badge,
    bookings,
    statusFilter,
    onStatusChange,
}: {
    title: string;
    badge: "DRY" | "FROZEN" | "COOLER";
    bookings: CargoBooking[];
    statusFilter: string;
    onStatusChange: (v: string) => void;
}) {
    const filtered = bookings.filter((b) => {
        if (statusFilter === "paid")   return b.paymentStatus === "PAID";
        if (statusFilter === "unpaid") return b.paymentStatus !== "PAID";
        return true; // "all"
    });

    return (
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden mb-5">
            {/* Section header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                    <h4 className="text-lg font-bold text-gray-800 italic">{title}</h4>
                    <p className="text-sm text-gray-500">
                        {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span
                        className={`px-5 py-1.5 rounded-lg text-white font-black text-xl ${BADGE_COLOR[badge] ?? "bg-gray-500"
                            }`}
                    >
                        {badge}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95">
                        <Printer className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead>
                        <tr className="bg-emerald-100">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[110px]">Invoice</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[130px]">Sender</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[130px]">Receiver</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Details</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[130px]">Payment Mode</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-[100px]">Amount</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[120px]">
                                {/* Inline status filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => onStatusChange(e.target.value)}
                                    className="bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                </select>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[160px]">Updated At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-gray-400 font-medium">
                                    No {badge.toLowerCase()} cargo shipments found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((booking) => {
                                const sender      = `${booking.user.firstName} ${booking.user.lastName}`;
                                const receiver    = booking.contactName || "N/A";
                                const itemDetails = booking.items.length > 0
                                    ? booking.items.map((i) => `${i.itemType}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")
                                    : "N/A";
                                const paymentMode = booking.invoice?.paymentMode || "---";

                                return (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-800 font-bold italic">
                                            #{booking.invoiceNo}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{sender}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{receiver}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{itemDetails}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{paymentMode}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 font-black text-right">
                                            ${booking.totalAmount.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={booking.paymentStatus} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(booking.updatedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    Showing {filtered.length} of {bookings.length} shipments
                </span>
            </div>
        </div>
    );
}

// ── VoyageContent ─────────────────────────────────────────────────────────────
// Fetches & renders the DRY / FROZEN / COOLER tables for one voyage.
// Mounts when the accordion is opened, unmounts when closed.

function VoyageContent({
    voyageId,
    apiFetch,
}: {
    voyageId: string;
    apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}) {
    const [loading, setLoading]     = useState(true);
    const [detail, setDetail]       = useState<VoyageDetail | null>(null);
    const [error, setError]         = useState<string | null>(null);
    const [dryFilter, setDry]       = useState("all");
    const [frozenFilter, setFrozen] = useState("all");
    const [coolerFilter, setCooler] = useState("all");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch(`/api/manifest/voyages/${voyageId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: VoyageDetail = await res.json();
                if (!cancelled) setDetail(data);
            } catch (e: any) {
                if (!cancelled) setError("Failed to load voyage details. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [voyageId, apiFetch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-emerald-600 font-semibold animate-pulse">Loading shipments…</p>
                </div>
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="py-8 text-center text-red-500 font-medium">
                {error ?? "No data found."}
            </div>
        );
    }

    return (
        <div>
            {/* Route + summary bar */}
            <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm mb-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <span className="text-xl font-semibold text-gray-800">
                            {detail.voyage.from.code}
                        </span>
                        <ArrowRight className="w-5 h-5 text-emerald-600" />
                        <span className="text-xl font-semibold text-gray-800">
                            {detail.voyage.to.code}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            ({detail.voyage.from.name} → {detail.voyage.to.name})
                        </span>
                    </div>

                    {/* Counts & revenue */}
                    <div className="flex items-center gap-5 text-sm font-semibold">
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            <span className="text-amber-700">{detail.summary.dry} DRY</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                            <span className="text-blue-700">{detail.summary.frozen} FROZEN</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                            <span className="text-cyan-700">{detail.summary.cooler} COOLER</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-emerald-700">
                            ${detail.summary.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
                        </span>
                        <span className="text-green-600">
                            ${detail.summary.paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid
                        </span>
                        <span className="text-red-500">
                            ${detail.summary.unpaidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unpaid
                        </span>
                    </div>
                </div>
            </div>

            {/* DRY / FROZEN / COOLER tables */}
            <CargoTypeTable
                title="DRY Cargo Shipments"
                badge="DRY"
                bookings={detail.bookings.dry}
                statusFilter={dryFilter}
                onStatusChange={setDry}
            />
            <CargoTypeTable
                title="Frozen Cargo Shipments"
                badge="FROZEN"
                bookings={detail.bookings.frozen}
                statusFilter={frozenFilter}
                onStatusChange={setFrozen}
            />
            <CargoTypeTable
                title="Cooler Cargo Shipments"
                badge="COOLER"
                bookings={detail.bookings.cooler}
                statusFilter={coolerFilter}
                onStatusChange={setCooler}
            />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Manifest() {
    const { user, apiFetch, isLoading: authLoading } = useAuth();

    const [voyages, setVoyages]                 = useState<VoyageSummary[]>([]);
    const [loadingVoyages, setLoadingVoyages]   = useState(true);
    const [page, setPage]                       = useState(1);
    const [totalPages, setTotalPages]           = useState(1);

    // The current (latest) voyage is always expanded on mount
    const [currentExpanded, setCurrentExpanded] = useState(true);
    // Track which past voyages are expanded
    const [expandedIds, setExpandedIds]         = useState<Set<string>>(new Set());

    // ── Fetch voyages list ────────────────────────────────────────────────────

    const fetchVoyages = useCallback(
        async (pageNum: number) => {
            setLoadingVoyages(true);
            try {
                const res = await apiFetch(`/api/manifest/voyages?page=${pageNum}&limit=10`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                setVoyages((prev) =>
                    pageNum === 1 ? data.voyages ?? [] : [...prev, ...(data.voyages ?? [])]
                );
                setTotalPages(data.pagination?.totalPages ?? 1);
                setPage(pageNum);
            } catch (err) {
                console.error("Failed to fetch voyages:", err);
            } finally {
                setLoadingVoyages(false);
            }
        },
        [apiFetch]
    );

    useEffect(() => {
        // Wait for the auth context to finish hydrating from localStorage.
        // Without this guard the first render fires with token=null → 401.
        if (authLoading) return;
        fetchVoyages(1);
    }, [fetchVoyages, authLoading]);

    const togglePastVoyage = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // First voyage = current; the rest are past
    const currentVoyage = voyages[0] ?? null;
    const pastVoyages   = voyages.slice(1);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ── Header ────────────────────────────────────────────────── */}
            <header className="relative h-[453px] rounded-b-[50px] overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={imgRectangle2.src}
                        alt="Container Yard"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between px-[108px] pt-[22px]">
                        <div className="absolute left-1/2 -translate-x-1/2 top-[6px]">
                            <Image
                                src={imgRectangle228.src}
                                alt="Dean's Shipping Ltd."
                                width={483}
                                height={132}
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <h2 className="text-[40px] font-semibold text-white tracking-wide uppercase">
                            {user?.role ?? "STAFF"}
                        </h2>
                        <p className="text-[30px] font-medium text-white mt-2">
                            {user ? `${user.firstName} ${user.lastName}` : ""}
                        </p>
                    </div>
                </div>
            </header>

            {/* ── Main ──────────────────────────────────────────────────── */}
            <main className="max-w-6xl mx-auto px-4 -mt-8 pt-32 pb-12">

                {/* Full-page loader */}
                {loadingVoyages && voyages.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-24">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-emerald-600 text-lg font-semibold animate-pulse tracking-widest">
                            SYNCING DATA…
                        </p>
                    </div>

                ) : voyages.length === 0 ? (
                    <div className="text-center py-24 text-gray-400 font-medium text-lg">
                        No voyages found.
                    </div>

                ) : (
                    <>
                        {/* ── Current Voyage (latest) ──────────────────── */}
                        {currentVoyage && (
                            <div className="bg-emerald-600 rounded-xl shadow-lg overflow-hidden mb-8">
                                {/* Toggle header */}
                                <button
                                    onClick={() => setCurrentExpanded((v) => !v)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-white hover:bg-emerald-700 transition-colors"
                                >
                                    <div className="flex items-center gap-5">
                                        <h3 className="text-2xl font-black tracking-tight">
                                            VOYAGE {currentVoyage.voyageNo}
                                        </h3>
                                        <span className="text-xl opacity-90">
                                            {new Date(currentVoyage.date).toLocaleDateString("en-GB")}
                                        </span>
                                        <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-semibold tracking-wider">
                                            {currentVoyage.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-5">
                                        <div className="text-right text-sm opacity-80 hidden sm:block">
                                            <div className="font-bold">
                                                {currentVoyage.summary.totalBookings} shipments
                                            </div>
                                            <div>
                                                ${currentVoyage.summary.totalAmount.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </div>
                                        </div>
                                        {currentExpanded
                                            ? <ChevronUp className="w-8 h-8 flex-shrink-0" />
                                            : <ChevronDown className="w-8 h-8 flex-shrink-0" />
                                        }
                                    </div>
                                </button>

                                {/* Content */}
                                {currentExpanded && (
                                    <div className="bg-emerald-50 p-6">
                                        <VoyageContent
                                            voyageId={currentVoyage.id}
                                            apiFetch={apiFetch}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Past Voyages ──────────────────────────────── */}
                        {pastVoyages.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 px-2">
                                    Past Voyages
                                </h3>

                                <div className="space-y-3">
                                    {pastVoyages.map((voyage) => {
                                        const isExpanded = expandedIds.has(voyage.id);
                                        return (
                                            <div
                                                key={voyage.id}
                                                className="border border-gray-200 rounded-lg overflow-hidden"
                                            >
                                                {/* Accordion toggle */}
                                                <button
                                                    onClick={() => togglePastVoyage(voyage.id)}
                                                    className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors"
                                                >
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <span className="text-xl font-black text-gray-800">
                                                            VOYAGE {voyage.voyageNo}
                                                        </span>
                                                        <span className="text-base text-gray-600">
                                                            {new Date(voyage.date).toLocaleDateString("en-GB")}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
                                                            {voyage.summary.totalBookings} shipments
                                                        </span>
                                                        <span className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                                                            {voyage.from.code}
                                                            <ArrowRight className="w-4 h-4" />
                                                            {voyage.to.code}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right text-sm text-gray-600 hidden sm:block">
                                                            <div className="font-semibold">
                                                                ${voyage.summary.totalAmount.toLocaleString("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </div>
                                                            <div className="flex gap-2 justify-end text-xs">
                                                                <span className="text-amber-600">{voyage.summary.dry}D</span>
                                                                <span className="text-blue-600">{voyage.summary.frozen}F</span>
                                                                <span className="text-cyan-600">{voyage.summary.cooler}C</span>
                                                            </div>
                                                        </div>
                                                        {isExpanded
                                                            ? <ChevronUp className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                                            : <ChevronDown className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                                        }
                                                    </div>
                                                </button>

                                                {/* Voyage detail */}
                                                {isExpanded && (
                                                    <div className="p-6 bg-white border-t border-gray-200">
                                                        <VoyageContent
                                                            voyageId={voyage.id}
                                                            apiFetch={apiFetch}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Load More */}
                                {page < totalPages && (
                                    <button
                                        onClick={() => fetchVoyages(page + 1)}
                                        disabled={loadingVoyages}
                                        className="w-full py-4 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium text-lg border-2 border-dashed border-emerald-300 hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingVoyages ? "Loading…" : "Load More Voyages…"}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
