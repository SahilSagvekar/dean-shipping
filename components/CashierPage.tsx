'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  FileText,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  ArrowUpDown
} from 'lucide-react';
import imgCalculator from "@/app/assets/95d3e8d8f1cfe73bf74e2e7130445f7dba384e98.png";

interface Invoice {
  id: string;
  invoiceNo: string;
  paymentStatus: 'PAID' | 'UNPAID';
  paymentMode?: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdAt: string;
  paidAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  cargoBooking?: {
    service: string;
    fromLocation: string;
    toLocation: string;
    type: string;
    boxContains?: string;
    damageFound?: string;
    items: { itemType: string; total: number; quantity: number }[];
    images?: { imageUrl: string }[];
  };
  passengerBooking?: {
    infantCount: number;
    childCount: number;
    adultCount: number;
    fromLocation: string;
    toLocation: string;
    contact?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CashierPage() {
  const { apiFetch, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'createdAt' | 'paidAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [remarkInputs, setRemarkInputs] = useState<Record<string, string>>({});

  // Fetch invoices
  const fetchInvoices = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: activeTab,
        sort: sortField,
        order: sortOrder,
      });
      if (search) params.append('search', search);

      const res = await apiFetch(`/api/invoices?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(currentPage, searchQuery);
  }, [activeTab, currentPage, sortField, sortOrder]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoices(1, searchQuery);
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (
    invoiceId: string, 
    newStatus: 'PAID' | 'UNPAID',
    paymentMode?: string
  ) => {
    setIsUpdating(invoiceId);
    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentStatus: newStatus,
          paymentMode: paymentMode || remarkInputs[invoiceId] || undefined
        }),
      });

      if (res.ok) {
        toast.success(`Invoice marked as ${newStatus}`);
        // Clear remark input
        setRemarkInputs(prev => {
          const updated = { ...prev };
          delete updated[invoiceId];
          return updated;
        });
        // Re-fetch current page to get fresh data
        await fetchInvoices(currentPage, searchQuery);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    } finally {
      setIsUpdating(null);
    }
  };

  // View invoice details
  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedInvoice(data.invoice);
        setShowInvoiceModal(true);
      } else {
        toast.error('Failed to load invoice details');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice details');
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, ' / ');
  };

  // Get booking type display
  const getBookingInfo = (invoice: Invoice) => {
    if (invoice.cargoBooking) {
      const items = invoice.cargoBooking.items;
      const firstItem = items[0];
      return {
        type: 'cargo',
        product: firstItem?.itemType || invoice.cargoBooking.type || 'Cargo',
        quantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        from: invoice.cargoBooking.fromLocation,
        to: invoice.cargoBooking.toLocation,
        details: invoice.cargoBooking.boxContains || 'N/A',
        damage: invoice.cargoBooking.damageFound || 'None',
        images: invoice.cargoBooking.images || [],
        contact: invoice.user.email,
      };
    }
    if (invoice.passengerBooking) {
      const pb = invoice.passengerBooking;
      const totalPassengers = pb.infantCount + pb.childCount + pb.adultCount;
      return {
        type: 'passenger',
        product: `Passenger (${totalPassengers})`,
        quantity: totalPassengers,
        from: pb.fromLocation,
        to: pb.toLocation,
        details: `${pb.adultCount} Adult, ${pb.childCount} Child, ${pb.infantCount} Infant`,
        damage: 'N/A',
        images: [],
        contact: pb.contact || invoice.user.email,
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="flex justify-center mb-4 px-8">
        <img
          src={imgCalculator.src}
          alt="Cashier"
          className="w-full max-w-[600px] h-auto object-contain"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-[1120px] mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or invoice number"
              className="w-full h-[50px] border-2 border-[#296341] rounded-[20px] pl-14 pr-4 text-[18px] text-gray-600 outline-none focus:ring-2 focus:ring-[#296341]/30"
            />
          </div>
        </form>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8 max-w-[1120px] mx-auto">
          <button
            onClick={() => {
              setActiveTab('PAID');
              setCurrentPage(1);
            }}
            className={`flex-1 h-[60px] rounded-[10px] text-[40px] font-medium transition-all ${
              activeTab === 'PAID'
                ? 'bg-[#296341] text-white'
                : 'bg-[#d9d9d9] text-[#296341] border border-black'
            }`}
          >
            PAID
          </button>
          <button
            onClick={() => {
              setActiveTab('UNPAID');
              setCurrentPage(1);
            }}
            className={`flex-1 h-[60px] rounded-[10px] text-[40px] font-medium transition-all ${
              activeTab === 'UNPAID'
                ? 'bg-[#296341] text-white'
                : 'bg-[#d9d9d9] text-[#296341] border border-black'
            }`}
          >
            UNPAID
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-end gap-3 mb-4 max-w-[1120px] mx-auto">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#296341] rounded-lg text-sm font-bold text-[#296341] hover:bg-[#296341] hover:text-white transition-all active:scale-95"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
          {activeTab === 'PAID' && (
            <button
              onClick={() => {
                setSortField(sortField === 'createdAt' ? 'paidAt' : 'createdAt');
                setCurrentPage(1);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:border-[#296341] transition-all"
            >
              Sort by: {sortField === 'createdAt' ? 'Created' : 'Paid Date'}
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#296341]" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl">No {activeTab.toLowerCase()} invoices found</p>
          </div>
        ) : (
          <>
            {/* Invoice Cards */}
            <div className="space-y-6 max-w-[1120px] mx-auto">
              {invoices.map((invoice) => {
                const bookingInfo = getBookingInfo(invoice);
                if (!bookingInfo) return null;

                return (
                  <div
                    key={invoice.id}
                    className="bg-[#effaf6] rounded-[10px] shadow-md p-6 border border-[#296341]/20"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-medium">Name</span>
                        <div className="bg-white border border-[#296341] rounded-[5px] px-4 py-1">
                          <span className="text-[15px]">
                            {invoice.user.firstName} {invoice.user.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-medium">Invoice no.</span>
                        <div className="bg-white border border-[#296341] rounded-[5px] px-4 py-1">
                          <span className="text-[15px]">#{invoice.invoiceNo}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-medium">Date</span>
                        <div className="bg-white border border-[#296341] rounded-[5px] px-4 py-1">
                          <span className="text-[15px]">{formatDate(invoice.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-medium">Location</span>
                        <div className="bg-white border border-[#296341] rounded-[5px] px-4 py-1">
                          <span className="text-[15px]">
                            {bookingInfo.from} → {bookingInfo.to}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap gap-6 mb-4">
                      <div>
                        <span className="text-[18px] font-medium">Product : </span>
                        <span className="text-[15px]">{bookingInfo.product}</span>
                      </div>
                      <div>
                        <span className="text-[18px] font-medium">Quantity : </span>
                        <span className="text-[15px]">{bookingInfo.quantity}</span>
                      </div>
                      <div>
                        <span className="text-[18px] font-medium">Amount : </span>
                        <span className="text-[15px] font-medium">${invoice.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="ml-auto">
                        {/* Payment Status Toggle */}
                        <div className="flex bg-white border border-[#296341] rounded-full overflow-hidden">
                          <button
                            onClick={() => {
                              if (invoice.paymentStatus !== 'PAID') {
                                if (!remarkInputs[invoice.id]?.trim()) {
                                  toast.error('Please add a remark before marking as paid');
                                  return;
                                }
                                handleUpdatePaymentStatus(invoice.id, 'PAID', remarkInputs[invoice.id]);
                              }
                            }}
                            disabled={isUpdating === invoice.id}
                            className={`px-4 py-1 text-[15px] font-semibold transition-all ${
                              invoice.paymentStatus === 'PAID'
                                ? 'bg-[#18d240] text-white'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            PAID
                          </button>
                          <button
                            onClick={() => {
                              if (invoice.paymentStatus !== 'UNPAID') {
                                handleUpdatePaymentStatus(invoice.id, 'UNPAID');
                              }
                            }}
                            disabled={isUpdating === invoice.id}
                            className={`px-4 py-1 text-[15px] font-semibold transition-all ${
                              invoice.paymentStatus === 'UNPAID'
                                ? 'bg-[#ff4747] text-white'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            UNPAID
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Row */}
                    <div className="flex flex-wrap gap-6 mb-4">
                      <div>
                        <span className="text-[18px] font-medium">Email : </span>
                        <span className="text-[15px]">{invoice.user.email}</span>
                      </div>
                      <div>
                        <span className="text-[18px] font-medium">Contact : </span>
                        <span className="text-[15px]">{bookingInfo.contact}</span>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-wrap items-end gap-6">
                      {/* Image Preview */}
                      {bookingInfo.images.length > 0 && (
                        <div className="relative w-[207px] h-[113px] rounded-[10px] overflow-hidden border border-[#296341]">
                          <img
                            src={bookingInfo.images[0].imageUrl}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                          {bookingInfo.images.length > 1 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-[30px] font-bold">
                                +{bookingInfo.images.length - 1}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-[18px] font-medium">Product Details:</p>
                        <p className="text-[18px]">{bookingInfo.details}</p>
                      </div>

                      {/* Product Damage */}
                      <div className="min-w-[150px]">
                        <p className="text-[18px] font-medium">Product Damage:</p>
                        <p className="text-[18px]">{bookingInfo.damage}</p>
                      </div>

                      {/* Remark & Actions */}
                      <div className="flex flex-col gap-2 min-w-[210px]">
                        <label className="text-[18px] font-medium">Remark</label>
                        <input
                          type="text"
                          value={remarkInputs[invoice.id] || ''}
                          onChange={(e) => setRemarkInputs(prev => ({
                            ...prev,
                            [invoice.id]: e.target.value
                          }))}
                          placeholder={activeTab === 'UNPAID' ? `Collect $${invoice.totalAmount.toFixed(0)}` : 'Payment note'}
                          className="w-full h-[44px] bg-[#e5ebf3] border border-black px-3 text-[15px] outline-none"
                        />
                        {activeTab === 'UNPAID' && (
                          <button
                            onClick={() => {
                              if (!remarkInputs[invoice.id]?.trim()) {
                                toast.error('Please add a remark before marking as paid');
                                return;
                              }
                              handleUpdatePaymentStatus(
                                invoice.id, 
                                'PAID', 
                                remarkInputs[invoice.id]
                              );
                            }}
                            disabled={isUpdating === invoice.id}
                            className="bg-[#132540] text-white h-[40px] rounded-full text-[22px] font-semibold hover:bg-[#1a3254] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isUpdating === invoice.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              'SUBMIT'
                            )}
                          </button>
                        )}
                      </div>

                      {/* View Invoice Button */}
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="bg-[#5f8a71] border border-[#296341] text-white h-[34px] px-6 rounded-[5px] text-[22px] font-medium hover:bg-[#4a7a5f] transition-all"
                      >
                        VIEW INVOICE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between max-w-[1120px] mx-auto mt-8">
                <p className="text-[18px] text-[#3b3b3b]">
                  Showing {invoices.length} of {pagination.total} {activeTab.toLowerCase()} invoices
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-[#296341] rounded-[10px] disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#296341]" />
                  </button>
                  <span className="px-4 text-[18px] font-medium text-[#296341]">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 border border-[#296341] rounded-[10px] disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronRight className="w-5 h-5 text-[#296341]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Invoice Preview Modal */}
      {showInvoiceModal && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}

// Invoice Modal Component
function InvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getBookingDetails = () => {
    if (invoice.cargoBooking) {
      return {
        type: 'Cargo Booking',
        from: invoice.cargoBooking.fromLocation,
        to: invoice.cargoBooking.toLocation,
        items: invoice.cargoBooking.items.map(item => ({
          description: item.itemType,
          quantity: item.quantity || 1,
          total: item.total
        }))
      };
    }
    if (invoice.passengerBooking) {
      const pb = invoice.passengerBooking;
      const items = [];
      if (pb.adultCount > 0) items.push({ description: 'Adult Passenger', quantity: pb.adultCount, total: pb.adultCount * 65 });
      if (pb.childCount > 0) items.push({ description: 'Child Passenger', quantity: pb.childCount, total: pb.childCount * 45 });
      if (pb.infantCount > 0) items.push({ description: 'Infant Passenger', quantity: pb.infantCount, total: 0 });
      return {
        type: 'Passenger Booking',
        from: pb.fromLocation,
        to: pb.toLocation,
        items
      };
    }
    return null;
  };

  const bookingDetails = getBookingDetails();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl w-full max-w-[800px] max-h-[90vh] overflow-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#296341]">
            Invoice #{invoice.invoiceNo}
          </h2>
          <div className="flex items-center gap-2" data-print-hidden="true">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-4" id="invoice-content">
          {/* Company Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-[#296341]">
              DEAN'S SHIPPING LTD.
            </h1>
            <p className="text-gray-500 mt-1">Freight & Logistics Services</p>
            <p className="text-gray-400 text-sm mt-1">
              123 Harbor Drive, Nassau, Bahamas
            </p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
              <p className="text-lg font-medium">
                {invoice.user.firstName} {invoice.user.lastName}
              </p>
              <p className="text-gray-600">{invoice.user.email}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-gray-500">Invoice No:</span>
                <span className="ml-2 font-bold">#{invoice.invoiceNo}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">Date:</span>
                <span className="ml-2 font-medium">
                  {formatDate(invoice.createdAt)}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                    invoice.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {invoice.paymentStatus}
                </span>
              </div>
              {invoice.paidAt && (
                <div>
                  <span className="text-gray-500">Paid On:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(invoice.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Route Info */}
          {bookingDetails && (
            <div className="bg-[#effaf6] rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">
                {bookingDetails.type}
              </p>
              <p className="text-xl font-bold flex items-center gap-3">
                {bookingDetails.from}{" "}
                <ArrowRight className="w-5 h-5 text-[#296341]" />{" "}
                {bookingDetails.to}
              </p>
            </div>
          )}

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-[#296341]">
                <th className="text-left py-3 text-gray-700">Description</th>
                <th className="text-center py-3 text-gray-700">Qty</th>
                <th className="text-right py-3 text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookingDetails?.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t-2 border-[#296341] pt-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">VAT (12%)</span>
              <span className="font-medium">
                ${invoice.vatAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-[#296341] mt-2">
              <span className="text-xl font-bold">Total Amount</span>
              <span className="text-2xl font-black text-[#296341]">
                ${invoice.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Mode */}
          {invoice.paymentMode && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Payment Note:</p>
              <p className="font-medium">{invoice.paymentMode}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-gray-400 text-sm">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              For inquiries, contact: info@deansshipping.com
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-4"
          data-print-hidden="true"
        >
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-[#296341] text-white rounded-lg hover:bg-[#1e4a2e] transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}