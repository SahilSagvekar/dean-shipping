"use client";

import { useState } from "react";
import image1 from "@/app/assets/5116e4be081f83018c8edb2f7af47539cf88e4f0.png";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Ship,
  Navigation,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrackingResult {
  invoiceNo: string;
  service: string;
  type: string;
  fromLocation: string;
  toLocation: string;
  bookingDate: string;
  paymentStatus: "PAID" | "UNPAID" | "PARTIAL";
  totalAmount: number;
  vatAmount: number;
  subtotal: number;
  remark?: string | null;
  voyageNo?: string | null;
  contactName: string;
  items: { itemType: string; quantity: number; unitPrice: number; total: number }[];
  status?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  UNPAID: { label: "Unpaid", cls: "bg-red-100 text-red-700 border border-red-200" },
  PARTIAL: { label: "Partial", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
};

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// MarineTraffic public embed — ship #4127087, centred on Nassau, Bahamas
const MARINE_TRAFFIC_EMBED =
  "https://www.marinetraffic.com/en/ais/embed/zoom:9/centery:25.05/centerx:-77.45/maptype:0/shownames:true/mmsi:0/shipid:4127087/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false";

// ─── Component ───────────────────────────────────────────────────────────────

export default function ShipmentPage() {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    const trimmed = invoiceNo.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      // First try cargo bookings
      const res = await fetch(`/api/bookings/cargo?invoiceNo=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        // Try passenger bookings as fallback
        const pasRes = await fetch(`/api/bookings/passenger?invoiceNo=${encodeURIComponent(trimmed)}`);
        const pasData = await pasRes.json();

        if (!pasRes.ok || !pasData.booking) {
          setError("No shipment found with this invoice number. Please check and try again.");
          return;
        }
        // Map passenger booking
        const b = pasData.booking;
        setResult({
          invoiceNo: b.invoiceNo,
          service: "PASSENGER",
          type: "PASSENGER",
          fromLocation: b.fromLocation,
          toLocation: b.toLocation,
          bookingDate: b.bookingDate,
          paymentStatus: b.paymentStatus,
          totalAmount: b.totalAmount,
          vatAmount: b.vatAmount,
          subtotal: b.subtotal,
          remark: b.remark,
          voyageNo: b.voyageNo,
          contactName: b.name,
          items: [],
          status: b.voyage?.status,
        });
        return;
      }

      // The GET returns a paginated list; check if invoiceNo matches
      const bookings: any[] = data.bookings || [];
      const match = bookings.find(
        (b: any) => b.invoiceNo?.toLowerCase() === trimmed.toLowerCase()
      );

      if (!match) {
        setError("No shipment found with this invoice number. Please check and try again.");
        return;
      }

      setResult({
        invoiceNo: match.invoiceNo,
        service: match.service,
        type: match.type,
        fromLocation: match.fromLocation,
        toLocation: match.toLocation,
        bookingDate: match.bookingDate,
        paymentStatus: match.paymentStatus,
        totalAmount: match.totalAmount,
        vatAmount: match.vatAmount,
        subtotal: match.subtotal,
        remark: match.remark,
        voyageNo: match.voyageNo,
        contactName: match.contactName,
        items: match.items || [],
        status: match.voyage?.status,
      });
    } catch (err: any) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTrack();
  };

  const badge = result ? PAYMENT_BADGE[result.paymentStatus] || PAYMENT_BADGE.UNPAID : null;

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative mt-20 md:mt-[135px] h-[300px] md:h-[570px] overflow-hidden">
        <img
          alt="Cargo ship aerial view"
          className="w-full h-full object-cover"
          src={image1.src}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />

        {/* Overlay headline */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-14 text-white">
          <div className="max-w-[1440px] mx-auto">
            <p className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-emerald-300 mb-2">
              Dean&apos;s Shipping Ltd
            </p>
            <h1 className="font-bold text-3xl md:text-5xl leading-tight drop-shadow-lg">
              Track Your Shipment
            </h1>
          </div>
        </div>
      </section>

      {/* ── Search Card ──────────────────────────────────────────────────── */}
      <section className="relative -mt-16 md:-mt-[137px] pb-8 md:pb-12 z-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="mx-auto w-full max-w-[1075px] bg-white rounded-2xl shadow-2xl px-6 md:px-16 py-8 md:py-12 border border-emerald-50">
            <h2 className="font-['Inter'] font-semibold text-2xl md:text-[40px] text-[#296341] mb-3 text-center leading-tight">
              Find and track your shipment
            </h2>
            <p className="text-center text-gray-400 text-sm md:text-base mb-8 md:mb-10">
              Enter your invoice number to see real-time booking and payment details
            </p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-4 items-stretch md:items-center justify-center">
              <div className="relative flex-1 md:max-w-[571px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#296341]/50 w-5 h-5" />
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => { setInvoiceNo(e.target.value); setSearched(false); setError(null); setResult(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 84726391"
                  className="w-full h-[52px] pl-12 pr-4 rounded-[10px] border-2 border-[#296341] font-['Inter'] font-medium text-lg text-[#626262] placeholder:text-[#626262]/40 focus:outline-none focus:ring-2 focus:ring-[#296341]/30 transition"
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={isLoading || !invoiceNo.trim()}
                className="w-full md:w-[180px] h-[52px] bg-[#296341] hover:bg-[#1e4d30] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-['Inter'] font-semibold text-lg rounded-[10px] active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Searching…</>
                ) : (
                  <><Search className="w-5 h-5" /> Track</>
                )}
              </button>
            </div>

            {/* ── Result / Error ─────────────────────────────────────────── */}
            {searched && !isLoading && (
              <div className="mt-8">
                {error ? (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                ) : result ? (
                  <div className="space-y-5 animate-in fade-in duration-300">

                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Invoice</p>
                        <p className="text-2xl font-extrabold text-[#296341] tracking-wide">
                          #{result.invoiceNo}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {badge && (
                          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${badge.cls}`}>
                            {result.paymentStatus === "PAID" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {badge.label}
                          </span>
                        )}
                        {result.status && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            <Ship className="w-3.5 h-3.5" />
                            {result.status.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <InfoTile icon={<Package className="w-4 h-4" />} label="Service" value={result.service} />
                      <InfoTile icon={<Navigation className="w-4 h-4" />} label="Type" value={result.type} />
                      <InfoTile
                        icon={<Calendar className="w-4 h-4" />}
                        label="Booking Date"
                        value={new Date(result.bookingDate).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      />
                      <InfoTile icon={<MapPin className="w-4 h-4" />} label="From" value={result.fromLocation} />
                      <InfoTile icon={<MapPin className="w-4 h-4" />} label="To" value={result.toLocation} />
                      {result.voyageNo && (
                        <InfoTile icon={<Ship className="w-4 h-4" />} label="Voyage #" value={result.voyageNo} />
                      )}
                    </div>

                    {/* Items */}
                    {result.items.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">Items</p>
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                              <tr>
                                <th className="text-left px-4 py-3">Description</th>
                                <th className="text-center px-4 py-3">Qty</th>
                                <th className="text-right px-4 py-3">Unit Price</th>
                                <th className="text-right px-4 py-3">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {result.items.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-3 font-medium text-gray-800">{item.itemType}</td>
                                  <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(item.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="bg-[#f4faf7] rounded-xl p-4 md:p-6 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{fmt(result.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT (12%)</span>
                        <span>{fmt(result.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-[#296341] border-t border-[#296341]/20 pt-2 mt-2">
                        <span>Total Amount</span>
                        <span>{fmt(result.totalAmount)}</span>
                      </div>
                    </div>

                    {result.remark && (
                      <p className="text-sm text-gray-500 italic flex items-start gap-2">
                        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {result.remark}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Live Map ─────────────────────────────────────────────────────── */}
      <section className="relative py-8 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="w-full max-w-[1360px] mx-auto">

            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#296341]/10 flex items-center justify-center">
                <Ship className="w-5 h-5 text-[#296341]" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Live Vessel Tracking</h2>
                <p className="text-sm text-gray-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time AIS data via MarineTraffic
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              <iframe
                title="Live vessel tracking – Dean's Shipping Ltd"
                src={MARINE_TRAFFIC_EMBED}
                width="100%"
                height="600"
                className="w-full h-[350px] md:h-[620px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <p className="mt-3 text-xs text-center text-gray-400">
              Vessel position data provided by{" "}
              <a
                href="https://www.marinetraffic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#296341] hover:underline"
              >
                MarineTraffic.com
              </a>
              . Updates every few minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2 text-[#296341]">
        {icon}
        <span className="text-xs uppercase tracking-widest font-semibold text-gray-400">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
    </div>
  );
}
