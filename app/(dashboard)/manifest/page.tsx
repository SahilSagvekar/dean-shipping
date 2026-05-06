"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Loader2,
  Ship,
  Package,
  Calendar,
  Users,
  Anchor,
  ArrowDown,
  ArrowUp,
  Minus,
  Printer,
  Check,
  Clock,
  DollarSign,
  Eye,
  X,
} from "lucide-react";
import imgRectangle228 from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle2 from "@/app/assets/7bfea36700cced4af0de8d5f4074e11966bfadd9.png";

// ── Types ──────────────────────────────────────────────

interface VoyageStop {
  stopOrder: number;
  location: { id: string; code: string; name: string };
  arrivalTime: string | null;
  departureTime: string | null;
  activities: string[];
  notes: string | null;
}

interface VoyageSummary {
  totalBookings: number;
  cargoBookings: number;
  passengerBookings: number;
  totalPassengers: number;
  dry: number;
  frozen: number;
  cooler: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

interface VoyageListItem {
  id: string;
  voyageNo: number;
  shipName: string;
  date: string;
  status: string;
  from: { code: string; name: string } | null;
  to: { code: string; name: string } | null;
  stops: VoyageStop[];
  summary: VoyageSummary;
}

interface StopBooking {
  id: string;
  invoiceNo?: string;
  fromLocation: string;
  toLocation: string;
  totalAmount: number;
  paymentStatus: string;
  bookingType: "CARGO" | "PASSENGER";
  loadStopOrder: number;
  unloadStopOrder: number;
  itemSummary: string;
  // Cargo-specific
  type?: string;
  containerNo?: string;
  service?: string;
  contactName?: string;
  // Passenger-specific
  name?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  // Relations
  user?: { firstName: string; lastName: string };
  items?: { itemType: string; quantity: number; total: number }[];
  invoice?: { paymentMode: string | null; paymentStatus: string } | null;
}

interface StopManifest {
  stopOrder: number;
  location: { id: string; code: string; name: string };
  arrivalTime: string | null;
  departureTime: string | null;
  activities: string[];
  notes: string | null;
  load: StopBooking[];
  unload: StopBooking[];
  staysOnBoard: StopBooking[];
  onBoard: StopBooking[];
  counts: {
    loading: number;
    unloading: number;
    stayingOnBoard: number;
    totalOnBoard: number;
  };
}

interface VoyageDetail {
  voyage: {
    id: string;
    voyageNo: number;
    shipName: string;
    date: string;
    status: string;
    from: { code: string; name: string } | null;
    to: { code: string; name: string } | null;
  };
  stops: StopManifest[];
  summary: {
    totalCargo: number;
    totalPassengers: number;
    totalBookings: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    cargo: { dry: number; frozen: number; cooler: number };
  };
}

// ── Color Palettes ─────────────────────────────────────

const VOYAGE_COLORS = [
  "bg-[#5f8a71]",
  "bg-[#edb8c1]",
  "bg-[#aed1ff]",
  "bg-[#d8d2b2]",
  "bg-[#99d9e4]",
  "bg-[#ccc4c4]",
  "bg-[rgba(25,177,134,0.5)]",
];

const STOP_SECTION_COLORS: Record<string, string> = {
  load: "bg-emerald-50 border-emerald-300",
  unload: "bg-amber-50 border-amber-300",
  stays: "bg-blue-50 border-blue-300",
};

// ── Helper Components ──────────────────────────────────

function PaymentBadge({ status }: { status: string }) {
  const isPaid = status === "PAID";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isPaid
          ? "bg-green-100 text-green-800 border border-green-300"
          : "bg-red-100 text-red-800 border border-red-300"
        }`}
    >
      {isPaid ? "Paid" : "Unpaid"}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CARGO: "bg-indigo-100 text-indigo-800 border-indigo-300",
    PASSENGER: "bg-purple-100 text-purple-800 border-purple-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${colors[type] || "bg-gray-100 text-gray-800 border-gray-300"
        }`}
    >
      {type === "CARGO" ? (
        <><Package className="w-3 h-3 mr-1" /> Cargo</>
      ) : (
        <><Users className="w-3 h-3 mr-1" /> Passenger</>
      )}
    </span>
  );
}

// ── Booking Row (Mobile Card + Desktop Table Row) ──────

function MobileBookingCard({
  booking,
  action,
}: {
  booking: StopBooking;
  action: "load" | "unload" | "stays";
}) {
  const senderName = booking.user
    ? `${booking.user.firstName} ${booking.user.lastName}`
    : booking.contactName || booking.name || "—";

  return (
    <div className="md:hidden p-4 rounded-xl border border-gray-200/60 bg-white/40 mb-2 space-y-3">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              {action === "load" && <ArrowDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {action === "unload" && <ArrowUp className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              {action === "stays" && <Minus className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              <span className="text-sm font-mono font-bold text-gray-800">
                  {booking.invoiceNo || "—"}
              </span>
          </div>
          <PaymentBadge status={booking.paymentStatus} />
      </div>
      
      <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{senderName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{booking.itemSummary}</p>
          </div>
          <div className="text-right">
              <p className="text-sm font-black text-gray-900">${booking.totalAmount.toFixed(2)}</p>
              <TypeBadge type={booking.bookingType} />
          </div>
      </div>
      
      <div className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {booking.fromLocation} → {booking.toLocation}
      </div>
    </div>
  );
}

function DesktopBookingRow({
  booking,
  action,
}: {
  booking: StopBooking;
  action: "load" | "unload" | "stays";
}) {
  const senderName = booking.user
    ? `${booking.user.firstName} ${booking.user.lastName}`
    : booking.contactName || booking.name || "—";

  return (
    <tr className="hidden lg:table-row border-b border-gray-200/60 hover:bg-white/60 transition-colors">
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          {action === "load" && <ArrowDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
          {action === "unload" && <ArrowUp className="w-4 h-4 text-amber-600 flex-shrink-0" />}
          {action === "stays" && <Minus className="w-4 h-4 text-blue-500 flex-shrink-0" />}
          <span className="text-sm font-mono font-bold text-gray-800">
            {booking.invoiceNo || "—"}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <TypeBadge type={booking.bookingType} />
      </td>
      <td className="py-2.5 px-3 text-sm text-gray-700 font-medium">{senderName}</td>
      <td className="py-2.5 px-3 text-sm text-gray-700 max-w-[200px] truncate">
        {booking.itemSummary}
      </td>
      <td className="py-2.5 px-3 text-sm font-medium text-gray-800">
        {booking.fromLocation} → {booking.toLocation}
      </td>
      <td className="py-2.5 px-3 text-sm font-bold text-gray-800">
        ${booking.totalAmount.toFixed(2)}
      </td>
      <td className="py-2.5 px-3">
        <PaymentBadge status={booking.paymentStatus} />
      </td>
    </tr>
  );
}

// ── Stop Section (Load / Unload / Stays On Board) ──────

function StopSection({
  title,
  icon,
  bookings,
  action,
  colorClass,
}: {
  title: string;
  icon: React.ReactNode;
  bookings: StopBooking[];
  action: "load" | "unload" | "stays";
  colorClass: string;
}) {
  if (bookings.length === 0) return null;

  return (
    <div className={`border rounded-xl overflow-hidden mb-3 ${colorClass}`}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-inherit bg-inherit/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
            {icon}
            <span className="font-bold text-sm text-gray-800 uppercase tracking-tight">
                {title}
            </span>
        </div>
        <span className="bg-gray-900/10 px-2 py-0.5 rounded text-xs font-black">
            {bookings.length}
        </span>
      </div>
      
      <div className="p-2 lg:p-0 overflow-x-auto">
        <table className="hidden lg:table w-full">
          <thead>
            <tr className="border-b border-gray-200/60">
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Sender</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <DesktopBookingRow key={b.id} booking={b} action={action} />
            ))}
          </tbody>
        </table>

        {/* Mobile View: Rendered as card list */}
        <div className="lg:hidden">
            {bookings.map((b) => (
              <MobileBookingCard key={b.id} booking={b} action={action} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Stop Card (one card per stop) ──────────────────────

function StopCard({
  stop,
  stopIndex,
  totalStops,
}: {
  stop: StopManifest;
  stopIndex: number;
  totalStops: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFirst = stopIndex === 0;
  const isLast = stopIndex === totalStops - 1;

  let stopLabel = `Stop ${stop.stopOrder}`;
  if (isFirst) stopLabel = "🟢 DEPARTURE";
  else if (isLast) stopLabel = "🔴 FINAL STOP";
  else stopLabel = `⬤ Stop ${stop.stopOrder}`;

  const hasActivity = stop.counts.loading > 0 || stop.counts.unloading > 0 || stop.counts.stayingOnBoard > 0;

  return (
    <div className="mb-4">
      {/* Stop Header */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all sm:overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] sm:text-lg font-bold whitespace-nowrap">{stopLabel}</span>
              <span className="text-xl sm:text-2xl font-black text-[#296341]">
                {stop.location.code}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{stop.location.name}</span>
            </div>
            <div className="flex flex-col gap-1 ml-2 sm:ml-4">
              {(stop.arrivalTime || stop.departureTime) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {stop.arrivalTime && (
                    <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Arrive:</span> {stop.arrivalTime}
                    </span>
                  )}
                  {stop.departureTime && (
                    <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Depart:</span> {stop.departureTime}
                    </span>
                  )}
                </div>
              )}
              {stop.activities && stop.activities.length > 0 && (
                <span className="text-[10px] sm:text-xs text-gray-400">
                  {stop.activities.join(" • ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
            {/* Quick count badges */}
            <div className="flex flex-wrap gap-2">
                {stop.counts.loading > 0 && (
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold">
                    <ArrowDown className="w-3 h-3 sm:w-4 h-4" /> {stop.counts.loading}
                </div>
                )}
                {stop.counts.unloading > 0 && (
                <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold">
                    <ArrowUp className="w-3 h-3 sm:w-4 h-4" /> {stop.counts.unloading}
                </div>
                )}
                {stop.counts.stayingOnBoard > 0 && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold">
                    <Ship className="w-3 h-3 sm:w-4 h-4" /> {stop.counts.stayingOnBoard}
                </div>
                )}
            </div>
            
            {!hasActivity && (
              <span className="text-[10px] sm:text-sm text-gray-400 italic">No activity</span>
            )}
            <ChevronDown
              className={`w-5 h-5 sm:w-6 h-6 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""
                }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded: booking tables */}
      {isExpanded && hasActivity && (
        <div className="mt-2 ml-4 sm:ml-6 space-y-2">
          <StopSection
            title="LOAD"
            icon={<ArrowDown className="w-4 h-4 text-emerald-600" />}
            bookings={stop.load}
            action="load"
            colorClass={STOP_SECTION_COLORS.load}
          />
          <StopSection
            title="UNLOAD"
            icon={<ArrowUp className="w-4 h-4 text-amber-600" />}
            bookings={stop.unload}
            action="unload"
            colorClass={STOP_SECTION_COLORS.unload}
          />
          <StopSection
            title="STAYS ON BOARD"
            icon={<Ship className="w-4 h-4 text-blue-500" />}
            bookings={stop.staysOnBoard}
            action="stays"
            colorClass={STOP_SECTION_COLORS.stays}
          />
        </div>
      )}
    </div>
  );
}

// ── Voyage Detail Modal ────────────────────────────────

function VoyageDetailView({
  voyageId,
  onClose,
}: {
  voyageId: string;
  onClose: () => void;
}) {
  const { apiFetch } = useAuth();
  const [detail, setDetail] = useState<VoyageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/api/manifest/voyages/${voyageId}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        } else {
          toast.error("Failed to load voyage details");
        }
      } catch (err) {
        console.error("Error fetching voyage detail:", err);
        toast.error("Failed to load voyage details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [voyageId, apiFetch]);

  const handlePrint = () => {
    if (!detail) return;
    const { voyage, stops, summary } = detail;
    const formattedDate = new Date(voyage.date).toLocaleDateString("en-GB", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const routeStr = stops.map((s) => s.location.code).join(" → ");

    const buildStopRows = (bookings: StopBooking[], action: string) => {
      if (!bookings.length) return "";
      const actionLabel = action === "load" ? "⬇ LOAD" : action === "unload" ? "⬆ UNLOAD" : "— STAYS ON BOARD";
      const bgColor = action === "load" ? "#d1fae5" : action === "unload" ? "#fef3c7" : "#dbeafe";
      return `
        <tr><td colspan="7" style="background:${bgColor};font-weight:bold;padding:6px 8px;font-size:12px;">${actionLabel} (${bookings.length})</td></tr>
        ${bookings.map((b) => {
          const sender = b.user ? `${b.user.firstName} ${b.user.lastName}` : b.contactName || b.name || "—";
          return `
            <tr>
              <td>${b.invoiceNo || "—"}</td>
              <td>${b.bookingType}</td>
              <td>${sender}</td>
              <td>${b.itemSummary}</td>
              <td>${b.fromLocation} → ${b.toLocation}</td>
              <td>$${b.totalAmount.toFixed(2)}</td>
              <td><span class="${b.paymentStatus === "PAID" ? "paid" : "unpaid"}">${b.paymentStatus}</span></td>
            </tr>`;
        }).join("")}`;
    };

    const stopsHtml = stops.map((stop, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === stops.length - 1;
      const label = isFirst ? "DEPARTURE" : isLast ? "FINAL STOP" : `Stop ${stop.stopOrder}`;
      const hasActivity = stop.load.length + stop.unload.length + stop.staysOnBoard.length > 0;
      return `
        <h2>${label}: ${stop.location.code} — ${stop.location.name}
          ${stop.arrivalTime ? `<span style="font-size:12px;font-weight:normal"> | Arrive: ${stop.arrivalTime}</span>` : ""}
          ${stop.departureTime ? `<span style="font-size:12px;font-weight:normal"> | Depart: ${stop.departureTime}</span>` : ""}
        </h2>
        ${!hasActivity ? `<p style="color:#999;font-style:italic;margin-bottom:12px;">No activity at this stop</p>` : `
        <table>
          <thead>
            <tr>
              <th>Invoice</th><th>Type</th><th>Sender</th><th>Details</th><th>Route</th><th>Amount</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${buildStopRows(stop.load, "load")}
            ${buildStopRows(stop.unload, "unload")}
            ${buildStopRows(stop.staysOnBoard, "stays")}
          </tbody>
        </table>`}`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Manifest — Voyage #${voyage.voyageNo}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; font-size: 13px; }
    h1 { font-size: 22px; margin-bottom: 2px; color: #296341; }
    h2 { font-size: 15px; margin: 18px 0 6px; color: #296341; border-bottom: 2px solid #296341; padding-bottom: 4px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 16px; }
    .summary { display: flex; gap: 32px; background: #f0f7f3; border: 1px solid #296341; padding: 12px 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .summary-item { text-align: center; }
    .summary-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
    .summary-value { font-size: 20px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    th, td { border: 1px solid #ccc; padding: 5px 7px; text-align: left; }
    th { background: #e8f4ee; font-weight: bold; color: #296341; }
    tr:nth-child(even) td { background: #fafafa; }
    .paid { background: #d4edda; color: #155724; padding: 1px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; }
    .unpaid { background: #f8d7da; color: #721c24; padding: 1px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; }
    @media print { body { margin: 10px; } }
  </style>
</head>
<body>
  <h1>FREIGHT MANIFEST — Voyage #${voyage.voyageNo}</h1>
  <div class="meta">${voyage.shipName} &nbsp;|&nbsp; ${formattedDate} &nbsp;|&nbsp; Route: ${routeStr}</div>
  <div class="summary">
    <div class="summary-item"><div class="summary-label">Total Bookings</div><div class="summary-value">${summary.totalBookings}</div></div>
    <div class="summary-item"><div class="summary-label">Cargo</div><div class="summary-value">${summary.totalCargo}</div></div>
    <div class="summary-item"><div class="summary-label">Passengers</div><div class="summary-value">${summary.totalPassengers}</div></div>
    <div class="summary-item"><div class="summary-label">Total Revenue</div><div class="summary-value">$${summary.totalAmount.toFixed(2)}</div></div>
    <div class="summary-item"><div class="summary-label" style="color:green;">Paid</div><div class="summary-value" style="color:green;">$${summary.paidAmount.toFixed(2)}</div></div>
    <div class="summary-item"><div class="summary-label" style="color:red;">Unpaid</div><div class="summary-value" style="color:red;">$${summary.unpaidAmount.toFixed(2)}</div></div>
  </div>
  ${stopsHtml}
  <div style="margin-top:32px;font-size:10px;color:#999;text-align:right;">Dean's Shipping Ltd — Confidential — Printed ${new Date().toLocaleString()}</div>
  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Allow popups to print"); return; }
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-12">
          <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const { voyage, stops, summary } = detail;
  const formattedDate = new Date(voyage.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-[1200px] mx-4">
        {/* Header */}
        <div className="bg-[#296341] text-white rounded-t-2xl px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-wide">
              MANIFEST — Voyage #{voyage.voyageNo}
            </h2>
            <p className="text-white/80 mt-1 flex items-center gap-3">
              <Ship className="w-5 h-5" /> {voyage.shipName} &nbsp;|&nbsp;
              <Calendar className="w-5 h-5" /> {formattedDate}
            </p>
            {/* Route visualization */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {stops.map((s, i) => (
                <span key={i} className="flex items-center gap-1 text-sm">
                  <span className="font-bold text-white">{s.location.code}</span>
                  {i < stops.length - 1 && (
                    <span className="text-white/50 mx-1">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <Printer className="w-5 h-5" /> Print Manifest
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-white border-b px-4 sm:px-8 py-5 flex flex-wrap gap-x-6 gap-y-4 sm:gap-8 justify-center sm:justify-start">
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Total Bookings</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800">{summary.totalBookings}</p>
          </div>
          <div className="text-center min-w-[60px]">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Cargo</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-600">{summary.totalCargo}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Passengers</p>
            <p className="text-xl sm:text-2xl font-black text-purple-600">{summary.totalPassengers}</p>
          </div>
          <div className="hidden sm:block h-12 w-px bg-gray-200" />
          <div className="text-center min-w-[100px]">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800">${summary.totalAmount.toFixed(0)}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Paid</p>
            <p className="text-xl sm:text-2xl font-black text-green-600">${summary.paidAmount.toFixed(0)}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight">Unpaid</p>
            <p className="text-xl sm:text-2xl font-black text-red-600">${summary.unpaidAmount.toFixed(0)}</p>
          </div>
          {summary.cargo.dry > 0 && (
            <div className="text-center min-w-[40px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Dry</p>
              <p className="text-lg font-black">{summary.cargo.dry}</p>
            </div>
          )}
          {summary.cargo.frozen > 0 && (
            <div className="text-center min-w-[40px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Froze</p>
              <p className="text-lg font-black">{summary.cargo.frozen}</p>
            </div>
          )}
          {summary.cargo.cooler > 0 && (
            <div className="text-center min-w-[40px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Cool</p>
              <p className="text-lg font-black">{summary.cargo.cooler}</p>
            </div>
          )}
        </div>

        {/* Stop-by-Stop Manifest */}
        <div className="px-4 sm:px-8 py-6 space-y-2">
          {/* Print-only header (hidden on screen) */}
          <div className="hidden print:block mb-6">
            <h1 className="text-xl font-bold">MANIFEST — Voyage #{voyage.voyageNo}</h1>
            <p className="text-sm">{voyage.shipName} | {formattedDate}</p>
            <p className="text-sm">Route: {stops.map((s) => s.location.code).join(" → ")}</p>
          </div>

          {stops.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <Anchor className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No stops configured for this voyage</p>
            </div>
          ) : (
            stops.map((stop, idx) => (
              <StopCard
                key={stop.stopOrder}
                stop={stop}
                stopIndex={idx}
                totalStops={stops.length}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Voyage List Item ───────────────────────────────────

function VoyageListCard({
  voyage,
  index,
  onViewManifest,
}: {
  voyage: VoyageListItem;
  index: number;
  onViewManifest: (id: string) => void;
}) {
  const colorClass =
    index === 0
      ? VOYAGE_COLORS[0]
      : VOYAGE_COLORS[(index % (VOYAGE_COLORS.length - 1)) + 1];

  const formattedDate = new Date(voyage.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, " / ");

  const routeStr = voyage.stops.length > 0
    ? voyage.stops.map((s) => s.location.code).join(" → ")
    : `${voyage.from?.code || "?"} → ${voyage.to?.code || "?"}`;

  return (
    <div
      className={`${colorClass} border border-black rounded-xl overflow-hidden mb-4 hover:shadow-lg transition-all active:scale-[0.99]`}
    >
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Left: Voyage info */}
        <div className="flex-1 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-[140px]">
            <Ship className="w-7 h-7 sm:w-8 sm:h-8 text-black/70" />
            <div>
              <p className="text-lg sm:text-xl font-black text-black leading-tight uppercase">
                VOYAGE {voyage.voyageNo}
              </p>
              <p className="text-[12px] sm:text-sm text-black/60 font-medium">{voyage.shipName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-black/80">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-base sm:text-lg font-bold">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-black/80 flex-1 min-w-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm font-bold truncate tracking-tight">{routeStr}</span>
          </div>
        </div>

        {/* Right: Summary + button */}
        <div className="flex items-center justify-between sm:justify-end gap-6 px-4 sm:px-6 py-3 border-t lg:border-t-0 lg:border-l border-black/10 bg-black/5">
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <div className="text-center">
              <p className="text-black/50 text-[10px] font-black uppercase tracking-tighter">Bookings</p>
              <p className="font-black text-black text-base sm:text-lg underline decoration-black/20 underline-offset-4">
                {voyage.summary.totalBookings}
              </p>
            </div>
            <div className="text-center">
              <p className="text-black/50 text-[10px] font-black uppercase tracking-tighter">Revenue</p>
              <p className="font-black text-black text-base sm:text-lg">
                ${voyage.summary.totalAmount.toFixed(0)}
              </p>
            </div>
            {voyage.summary.unpaidAmount > 0 && (
              <div className="text-center">
                <p className="text-red-900/40 text-[10px] font-black uppercase tracking-tighter">Unpaid</p>
                <p className="font-black text-red-900 text-base sm:text-lg">
                  ${voyage.summary.unpaidAmount.toFixed(0)}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onViewManifest(voyage.id)}
            className="bg-[#132540] hover:bg-[#1e3a63] text-white px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 uppercase tracking-widest"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Manifest</span><span className="sm:hidden">View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────

export default function ManifestPage() {
  const { apiFetch, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [voyages, setVoyages] = useState<VoyageListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedVoyageId, setSelectedVoyageId] = useState<string | null>(null);

  const fetchVoyages = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    try {
      const res = await apiFetch(
        `/api/manifest/voyages?page=${pageNum}&limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        const newVoyages = data.voyages || [];

        if (append) {
          setVoyages((prev) => {
            const existingIds = new Set(prev.map((v: VoyageListItem) => v.id));
            const unique = newVoyages.filter((v: VoyageListItem) => !existingIds.has(v.id));
            return [...prev, ...unique];
          });
        } else {
          // Deduplicate initial load too
          const seen = new Set<string>();
          const unique = newVoyages.filter((v: VoyageListItem) => {
            if (seen.has(v.id)) return false;
            seen.add(v.id);
            return true;
          });
          setVoyages(unique);
        }

        setHasMore(newVoyages.length === 10);
        setPage(pageNum);
      } else {
        toast.error("Failed to load voyages");
      }
    } catch (error) {
      console.error("Error fetching voyages:", error);
      toast.error("Failed to load voyages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <header className="relative">
        <div className="h-[350px] md:h-[450px] w-full overflow-hidden rounded-b-[50px]">
          <img
            src={imgRectangle2.src}
            alt="Containers"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Logo */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <img
            src={imgRectangle228.src}
            alt="Dean's Shipping Ltd."
            className="h-24 md:h-32 object-contain"
          />
        </div>

        {/* Role & Name */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            FREIGHT MANIFEST
          </h1>
          <p className="text-xl md:text-2xl font-medium">
            {user
              ? `${user.firstName} ${user.lastName}`
              : "Staff Member"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-white min-h-[600px] py-6 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
            </div>
          ) : voyages.length === 0 ? (
            <div className="text-center py-20 bg-gray-100 rounded-xl">
              <Ship className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-700">No voyages found</p>
              <p className="text-gray-500 mt-2">
                Create voyages from the Schedule Management page
              </p>
            </div>
          ) : (
            <>
              {voyages.map((voyage, index) => (
                <VoyageListCard
                  key={`${voyage.id}-${index}`}
                  voyage={voyage}
                  index={index}
                  onViewManifest={(id) => setSelectedVoyageId(id)}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <button
                  onClick={() => fetchVoyages(page + 1, true)}
                  className="text-xl font-medium text-[#296341] hover:text-[#1e4c30] transition-colors mt-4"
                >
                  Load More ......
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVoyageId && (
        <VoyageDetailView
          voyageId={selectedVoyageId}
          onClose={() => setSelectedVoyageId(null)}
        />
      )}
    </div>
  );
}