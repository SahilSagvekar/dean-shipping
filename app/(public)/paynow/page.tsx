"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Loader2,
    CreditCard,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Package,
    MapPin,
    Calendar,
    Receipt,
    Ship,
    ArrowRight,
    Lock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InvoiceData {
    id: string;
    invoiceNo: string;
    subtotal: number;
    vatAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: "PAID" | "UNPAID" | "PARTIAL";
    paymentMode?: string | null;
    dueDate?: string | null;
    cargoBooking?: {
        fromLocation: string;
        toLocation: string;
        service: string;
        items: { itemType: string; quantity: number; unitPrice: number; total: number }[];
    } | null;
    passengerBooking?: {
        fromLocation: string;
        toLocation: string;
        adultCount: number;
        childCount: number;
        infantCount: number;
        name: string;
    } | null;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return `$${(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

const STATUS_CONFIG = {
    PAID: {
        label: "Paid",
        cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        icon: <CheckCircle2 className="w-4 h-4" />,
    },
    UNPAID: {
        label: "Payment Due",
        cls: "bg-red-100 text-red-700 border border-red-200",
        icon: <XCircle className="w-4 h-4" />,
    },
    PARTIAL: {
        label: "Partially Paid",
        cls: "bg-amber-100 text-amber-700 border border-amber-200",
        icon: <AlertCircle className="w-4 h-4" />,
    },
};

// ─── Inner Page (needs useSearchParams) ──────────────────────────────────────

function PayNowContent() {
    const searchParams = useSearchParams();

    const [invoiceNo, setInvoiceNo] = useState(
        searchParams.get("invoiceNo") || ""
    );
    const [isSearching, setIsSearching] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const cancelled = searchParams.get("cancelled") === "true";

    // Auto-search if invoiceNo is in the URL
    useEffect(() => {
        const urlInvoice = searchParams.get("invoiceNo");
        if (urlInvoice) {
            fetchInvoice(urlInvoice);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInvoice = async (no: string) => {
        if (!no.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setInvoice(null);

        try {
            // Public lookup endpoint — no auth needed
            const res = await fetch(`/api/invoices/${encodeURIComponent(no.trim())}`);
            const data = await res.json();

            if (!res.ok || !data.invoice) {
                setSearchError(
                    data.error || "Invoice not found. Please check the number and try again."
                );
                return;
            }
            setInvoice(data.invoice);
        } catch {
            setSearchError("Something went wrong. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = () => fetchInvoice(invoiceNo);
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handlePayNow = async () => {
        if (!invoice) return;
        setIsPaying(true);

        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceNo: invoice.invoiceNo }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to initiate payment. Please try again.");
                return;
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setIsPaying(false);
        }
    };

    const statusCfg = invoice
        ? STATUS_CONFIG[invoice.paymentStatus] || STATUS_CONFIG.UNPAID
        : null;

    const canPay =
        invoice &&
        (invoice.paymentStatus === "UNPAID" || invoice.paymentStatus === "PARTIAL");

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f8f4] via-white to-[#f0f8f4]">
            {/* ── Header Bar ─────────────────────────────────────────────────── */}
            <div className="bg-[#296341] text-white py-12 px-4 text-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-24 -left-16 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute -bottom-16 -right-8 w-48 h-48 rounded-full bg-white/5" />

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Pay Your Invoice
                    </h1>
                    <p className="mt-2 text-emerald-200 text-base md:text-lg max-w-md mx-auto">
                        Secure online payment for Dean&apos;s Shipping Ltd
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
                {/* ── Cancelled Banner ─────────────────────────────────────────── */}
                {cancelled && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">Payment Cancelled</p>
                            <p className="text-xs mt-0.5 text-amber-700">
                                Your payment was not completed. You can try again below.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Search Card ──────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-[#296341]" />
                        Find Invoice
                    </h2>
                    <p className="text-sm text-gray-400 mb-5">
                        Enter your invoice number to view and pay outstanding balance
                    </p>

                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={invoiceNo}
                                onChange={(e) => {
                                    setInvoiceNo(e.target.value);
                                    setInvoice(null);
                                    setSearchError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. 84726391"
                                className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#296341] outline-none text-sm font-medium text-gray-700 transition"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !invoiceNo.trim()}
                            className="h-11 px-5 bg-[#296341] hover:bg-[#1e4d30] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            {isSearching ? "Searching…" : "Search"}
                        </button>
                    </div>

                    {searchError && (
                        <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="text-xs">{searchError}</p>
                        </div>
                    )}
                </div>

                {/* ── Invoice Detail Card ──────────────────────────────────────── */}
                {invoice && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in duration-300">
                        {/* Card header */}
                        <div className="bg-gradient-to-r from-[#296341] to-[#1e4d30] px-6 py-5 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-1">
                                        Invoice
                                    </p>
                                    <p className="text-2xl font-extrabold tracking-wide">
                                        #{invoice.invoiceNo}
                                    </p>
                                    {invoice.user && (
                                        <p className="text-sm text-emerald-200 mt-1">
                                            {invoice.user.firstName} {invoice.user.lastName}
                                        </p>
                                    )}
                                </div>
                                {statusCfg && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusCfg.cls}`}
                                    >
                                        {statusCfg.icon}
                                        {statusCfg.label}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Route info */}
                            {(invoice.cargoBooking || invoice.passengerBooking) && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    {invoice.cargoBooking ? (
                                        <Package className="w-5 h-5 text-[#296341] flex-shrink-0" />
                                    ) : (
                                        <Ship className="w-5 h-5 text-[#296341] flex-shrink-0" />
                                    )}
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 flex-wrap">
                                        <span className="font-bold text-gray-900">
                                            {invoice.cargoBooking?.fromLocation ||
                                                invoice.passengerBooking?.fromLocation}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-[#296341]" />
                                        <span className="font-bold text-gray-900">
                                            {invoice.cargoBooking?.toLocation ||
                                                invoice.passengerBooking?.toLocation}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            ({invoice.cargoBooking?.service || "Passenger"})
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            {invoice.cargoBooking?.items &&
                                invoice.cargoBooking.items.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                                            Items
                                        </p>
                                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                                    <tr>
                                                        <th className="text-left px-4 py-2.5">Description</th>
                                                        <th className="text-center px-4 py-2.5">Qty</th>
                                                        <th className="text-right px-4 py-2.5">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {invoice.cargoBooking.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                                {item.itemType}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-500">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                                {fmt(item.total)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            {/* Passenger summary */}
                            {invoice.passengerBooking && (
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Adults", count: invoice.passengerBooking.adultCount },
                                        { label: "Children", count: invoice.passengerBooking.childCount },
                                        { label: "Infants", count: invoice.passengerBooking.infantCount },
                                    ]
                                        .filter((p) => p.count > 0)
                                        .map((p) => (
                                            <div
                                                key={p.label}
                                                className="bg-gray-50 rounded-xl p-3 text-center"
                                            >
                                                <p className="text-lg font-bold text-[#296341]">
                                                    {p.count}
                                                </p>
                                                <p className="text-xs text-gray-500">{p.label}</p>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Amount Summary */}
                            <div className="bg-[#f4faf7] rounded-xl p-5 space-y-2.5">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{fmt(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>VAT (12%)</span>
                                    <span>{fmt(invoice.vatAmount)}</span>
                                </div>
                                {invoice.paidAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Amount Paid</span>
                                        <span>- {fmt(invoice.paidAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold text-[#296341] border-t border-[#296341]/20 pt-3 mt-3">
                                    <span>
                                        {invoice.paymentStatus === "PARTIAL"
                                            ? "Remaining Balance"
                                            : "Total Due"}
                                    </span>
                                    <span className="text-xl">
                                        {fmt(invoice.totalAmount - (invoice.paidAmount || 0))}
                                    </span>
                                </div>
                            </div>

                            {/* Paid state notice */}
                            {invoice.paymentStatus === "PAID" && (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Invoice Fully Paid</p>
                                        {invoice.paymentMode && (
                                            <p className="text-xs mt-0.5 text-emerald-600">
                                                via {invoice.paymentMode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Pay Now Button */}
                            {canPay && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handlePayNow}
                                        disabled={isPaying}
                                        className="w-full h-14 bg-[#296341] hover:bg-[#1e4d30] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-[#296341]/20"
                                    >
                                        {isPaying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Redirecting to Stripe…
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Pay{" "}
                                                {fmt(invoice.totalAmount - (invoice.paidAmount || 0))}{" "}
                                                Now
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>
                                            Secured by{" "}
                                            <span className="font-semibold text-gray-500">Stripe</span>
                                            . Your card details are never stored.
                                        </span>
                                    </div>

                                    {/* Accepted cards */}
                                    <div className="flex items-center justify-center gap-3 pt-1">
                                        {["VISA", "MC", "AMEX", "DISCOVER"].map((card) => (
                                            <div
                                                key={card}
                                                className="px-2 py-1 rounded border border-gray-200 text-[10px] font-bold text-gray-400 bg-gray-50"
                                            >
                                                {card}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── How it works ─────────────────────────────────────────────── */}
                {!invoice && !isSearching && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-widest">
                            How it works
                        </h3>
                        <div className="space-y-4">
                            {[
                                {
                                    step: "1",
                                    title: "Enter Invoice Number",
                                    desc: "Find your invoice number on the booking confirmation you received.",
                                },
                                {
                                    step: "2",
                                    title: "Review Your Invoice",
                                    desc: "Check the items, route, and total amount before proceeding.",
                                },
                                {
                                    step: "3",
                                    title: "Pay Securely via Stripe",
                                    desc: "Complete payment using any major credit or debit card. 100% secure.",
                                },
                            ].map((s) => (
                                <div key={s.step} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#296341]/10 text-[#296341] font-bold text-sm flex items-center justify-center flex-shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">
                                            {s.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page with Suspense boundary (required for useSearchParams) ───────────────

export default function PayNowPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#296341]" />
                </div>
            }
        >
            <PayNowContent />
        </Suspense>
    );
}
