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
  DollarSign,
  CreditCard,
  Printer,
  Filter,
  Search
} from "lucide-react";
import imgRectangle228 from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle2 from "@/app/assets/7bfea36700cced4af0de8d5f4074e11966bfadd9.png";

// Types
interface Shipment {
  id: string;
  invoiceNo: string;
  senderName: string;
  receiverName: string;
  itemDetails: string;
  paymentMode: string;
  amount: number;
  paymentStatus: 'PAID' | 'UNPAID';
  updatedAt: string;
}

interface Route {
  id: string;
  fromLocation: string;
  toLocation: string;
  shipments: Shipment[];
  totalShipments: number;
}

interface Voyage {
  id: string;
  voyageNo: string;
  date: string;
  status: string;
  routes: Route[];
  color: string;
}

// Voyage color palette
const VOYAGE_COLORS = [
  'bg-[#5f8a71]', // Current/Active - Green
  'bg-[#edb8c1]', // Pink
  'bg-[#aed1ff]', // Blue
  'bg-[#d8d2b2]', // Beige
  'bg-[#99d9e4]', // Cyan
  'bg-[#ccc4c4]', // Gray
  'bg-[rgba(25,177,134,0.5)]', // Teal
];

// Route row colors
const ROUTE_COLORS = [
  'bg-[#b5faff]', // Cyan
  'bg-[#e5f7f1]', // Light green
];

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: 'PAID' | 'UNPAID' }) {
  return (
    <div className={`border border-black px-4 py-1 min-w-[90px] text-center`}>
      <span className={`font-bold text-sm ${status === 'PAID' ? 'text-[#70cf5d]' : 'text-[#cf5d5d]'}`}>
        {status === 'PAID' ? 'Paid' : 'Unpaid'}
      </span>
    </div>
  );
}

// Shipment Row Component
function ShipmentRow({ shipment, index }: { shipment: Shipment; index: number }) {
  return (
    <>
      <tr className="border-b border-[#5F8A71]/30">
        <td className="py-3 px-2 text-sm font-medium text-black">{shipment.invoiceNo}</td>
        <td className="py-3 px-2 text-sm font-medium text-black">{shipment.senderName}</td>
        <td className="py-3 px-2 text-sm font-medium text-black">{shipment.receiverName}</td>
        <td className="py-3 px-2 text-sm font-medium text-black">{shipment.itemDetails}</td>
        <td className="py-3 px-2 text-sm font-medium text-black">{shipment.paymentMode || '------'}</td>
        <td className="py-3 px-2 text-sm font-medium text-black">${shipment.amount.toFixed(2)}</td>
        <td className="py-3 px-2">
          <PaymentStatusBadge status={shipment.paymentStatus} />
        </td>
        <td className="py-3 px-2 text-sm font-medium text-black">
          {new Date(shipment.updatedAt).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', ', ')}
        </td>
      </tr>
    </>
  );
}

// Route Card Component (Expandable)
function RouteCard({
  route,
  index,
  voyageNo,
  voyageDate,
  isExpanded,
  onToggle,
}: {
  route: Route;
  index: number;
  voyageNo: string;
  voyageDate: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  
  const filteredShipments = route.shipments.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.paymentStatus === statusFilter;
  });

  const bgColor = index % 2 === 0 ? ROUTE_COLORS[0] : ROUTE_COLORS[1];

  return (
    <div className="mb-3">
      {/* Route Header */}
      <div
        className={`${bgColor} border border-[#296341] rounded-[10px] h-[60px] flex items-center justify-between px-6 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#296341]" />
          <span className="text-xl md:text-2xl font-medium text-black">
            {route.fromLocation} <span className="mx-4">→</span> {route.toLocation}
          </span>
        </div>
        <ChevronRight className={`w-6 h-6 text-[#296341] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>

      {/* Expanded Shipments Table */}
      {isExpanded && (
        <div className="mt-2 bg-[#e5f7f1] border border-[#296341] rounded-[5px] overflow-hidden">
          {/* Table Header with Voyage Info */}
          <div className="px-4 py-3 border-b border-[#296341]">
            <p className="text-lg font-medium text-black">
              VOYAGE {voyageNo} &nbsp;&nbsp; {voyageDate}
            </p>
          </div>

          {/* Column Headers */}
          <div className="bg-[#d4e0d9] border-b border-[#296341]">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Invoice</th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Sender</th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Receiver/AGENT</th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Item Details</th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Payment Mode</th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Amount</th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">
                    <div className="flex items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          e.stopPropagation();
                          setStatusFilter(e.target.value as any);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white border border-black rounded px-2 py-1 text-sm font-semibold outline-none"
                      >
                        <option value="ALL">All</option>
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                      </select>
                    </div>
                  </th>
                  <th className="py-3 px-2 text-left text-sm font-semibold text-black">Updated at</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Shipment Rows */}
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No shipments found
                    </td>
                  </tr>
                ) : (
                  filteredShipments.slice(0, 5).map((shipment, idx) => (
                    <ShipmentRow key={shipment.id} shipment={shipment} index={idx} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#296341]">
            <p className="text-sm text-gray-600">
              Showing {Math.min(5, filteredShipments.length)} of {route.totalShipments} Shipments
            </p>
            <button className="border border-[#296341] text-[#296341] rounded-[10px] px-4 py-1.5 text-sm font-medium hover:bg-white transition-colors flex items-center gap-2">
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Voyage Accordion Component
function VoyageAccordion({
  voyage,
  index,
  isExpanded,
  onToggle,
}: {
  voyage: Voyage;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const colorClass = index === 0 ? VOYAGE_COLORS[0] : VOYAGE_COLORS[(index % (VOYAGE_COLORS.length - 1)) + 1];

  // Format date
  const formattedDate = new Date(voyage.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, ' / ');

  return (
    <div className="mb-3">
      {/* Voyage Header */}
      <div
        className={`${colorClass} border border-black h-[70px] flex items-center justify-between px-6 cursor-pointer hover:shadow-lg transition-shadow`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-8">
          <span className="text-xl md:text-2xl font-semibold text-black">
            VOYAGE {voyage.voyageNo}
          </span>
          <span className="text-xl md:text-2xl font-medium text-black">
            {formattedDate}
          </span>
        </div>
        <ChevronDown className={`w-8 h-8 text-black transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded Routes */}
      {isExpanded && (
        <div className={`${colorClass} border-x border-b border-black px-4 py-4`}>
          {voyage.routes.map((route, idx) => (
            <RouteCard
              key={route.id}
              route={route}
              index={idx}
              voyageNo={voyage.voyageNo}
              voyageDate={formattedDate}
              isExpanded={expandedRouteId === route.id}
              onToggle={() => setExpandedRouteId(expandedRouteId === route.id ? null : route.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function ManifestPage() {
  const { apiFetch, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [expandedVoyageId, setExpandedVoyageId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch voyages
  const fetchVoyages = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    try {
      const res = await apiFetch(`/api/voyages?page=${pageNum}&limit=10&include=routes,shipments`);
      if (res.ok) {
        const data = await res.json();
        const newVoyages = data.voyages || [];
        
        if (append) {
          setVoyages(prev => [...prev, ...newVoyages]);
        } else {
          setVoyages(newVoyages);
          // Auto-expand first voyage
          if (newVoyages.length > 0) {
            setExpandedVoyageId(newVoyages[0].id);
          }
        }
        
        setHasMore(newVoyages.length === 10);
        setPage(pageNum);
      } else {
        toast.error('Failed to load voyages');
      }
    } catch (error) {
      console.error('Error fetching voyages:', error);
      toast.error('Failed to load voyages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  const handleLoadMore = () => {
    fetchVoyages(page + 1, true);
  };

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
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">FREIGHT SUPERVISOR</h1>
          <p className="text-xl md:text-2xl font-medium">
            {user ? `${user.firstName} ${user.lastName}` : 'Staff Member'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-[#5f8a71] min-h-[600px] py-6 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
          ) : voyages.length === 0 ? (
            <div className="text-center py-20 bg-white/20 rounded-xl">
              <Ship className="w-16 h-16 mx-auto mb-4 text-white/70" />
              <p className="text-xl text-white">No voyages found</p>
            </div>
          ) : (
            <>
              {/* Voyage Accordions */}
              {voyages.map((voyage, index) => (
                <VoyageAccordion
                  key={voyage.id}
                  voyage={voyage}
                  index={index}
                  isExpanded={expandedVoyageId === voyage.id}
                  onToggle={() => setExpandedVoyageId(
                    expandedVoyageId === voyage.id ? null : voyage.id
                  )}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="text-xl font-medium text-black hover:text-white transition-colors mt-4"
                >
                  Load More ......
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}