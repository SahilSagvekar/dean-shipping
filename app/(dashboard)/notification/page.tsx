"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Bell,
  Loader2,
  Mail,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  MapPin,
  Package,
  User,
  Phone,
  Calendar,
  FileText,
  Send,
  Settings
} from "lucide-react";
import imgUntitled71 from "@/app/assets/3956b95e786ae07d9128fd4f6de57a9d0b031af5.png";

// Types
interface Invoice {
  id: string;
  invoiceNo: string;
  paymentStatus: 'PAID' | 'UNPAID';
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber?: string;
  };
  cargoBooking?: {
    service: string;
    fromLocation: string;
    toLocation: string;
    items: { type: string; quantity: number }[];
  };
  passengerBooking?: {
    fromLocation: string;
    toLocation: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface ReminderSettings {
  frequency: 'DAILY' | 'EVERY_2_DAYS' | 'EVERY_5_DAYS' | 'EVERY_7_DAYS';
  lastSent?: string;
}

// Reminder frequency options
const REMINDER_FREQUENCIES = [
  { value: 'DAILY', label: 'Every Day' },
  { value: 'EVERY_2_DAYS', label: 'Every 2 Days' },
  { value: 'EVERY_5_DAYS', label: 'Every 5 Days' },
  { value: 'EVERY_7_DAYS', label: 'Every 7 Days' },
];

// Radio Button Component
function RadioButton({
  selected,
  onClick,
  label
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <div className={`w-[30px] h-[30px] rounded-full border-[3px] flex items-center justify-center transition-colors ${selected ? 'border-black bg-black' : 'border-black bg-white group-hover:bg-gray-100'
        }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-white" />}
      </div>
      <span className="text-xl md:text-2xl font-medium text-black">{label}</span>
    </button>
  );
}

// Payment Status Toggle Component
function PaymentStatusToggle({
  isPaid,
  onChange,
  disabled,
}: {
  isPaid: boolean;
  onChange: (paid: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative bg-white border border-[#296341] rounded-full h-[27px] w-[210px] flex items-center">
      {/* Sliding background */}
      <div
        className={`absolute h-[27px] w-[114px] rounded-full transition-all duration-200 ${isPaid ? 'left-0 bg-green-500' : 'left-[96px] bg-[#ff4747]'
          } border border-black`}
      />
      {/* Labels */}
      <button
        onClick={() => !disabled && onChange(true)}
        disabled={disabled}
        className={`relative z-10 flex-1 text-center text-sm font-semibold transition-colors ${isPaid ? 'text-white' : 'text-gray-500'
          }`}
      >
        PAID
      </button>
      <button
        onClick={() => !disabled && onChange(false)}
        disabled={disabled}
        className={`relative z-10 flex-1 text-center text-sm font-semibold transition-colors ${!isPaid ? 'text-white' : 'text-gray-500'
          }`}
      >
        UNPAID
      </button>
    </div>
  );
}

// Field Display Component
function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-black">{label}</span>
      <div className="bg-white border border-[#296341] rounded-[5px] px-3 py-1.5 min-w-[100px]">
        <span className="text-sm text-black">{value}</span>
      </div>
    </div>
  );
}

// Inline Field Component
function InlineField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-black">{label}:</span>
      <span className="text-sm text-black">{value}</span>
    </div>
  );
}

// Pending Payment Card Component
function PendingPaymentCard({
  invoice,
  onStatusChange,
  isUpdating,
}: {
  invoice: Invoice;
  onStatusChange: (id: string, paid: boolean) => void;
  isUpdating: boolean;
}) {
  const user = invoice.user;
  const cargo = invoice.cargoBooking;
  const passenger = invoice.passengerBooking;

  const fromCode = cargo?.fromLocation || passenger?.fromLocation || 'N/A';
  const toCode = cargo?.toLocation || passenger?.toLocation || 'N/A';
  const product = cargo?.items?.[0]?.type || (passenger ? 'Passenger' : 'N/A');
  const quantity = cargo?.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;

  return (
    <div className="bg-[#effaf6] border border-[#296341] rounded-[10px] p-4 space-y-3">
      {/* Row 1: Name, Invoice, Date, Location */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FieldDisplay
          label="Name"
          value={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
        />
        <FieldDisplay
          label="Invoice no."
          value={`#${invoice.invoiceNo}`}
        />
        <FieldDisplay
          label="Date"
          value={new Date(invoice.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, ' / ')}
        />
        <FieldDisplay
          label="Location"
          value={`${fromCode} → ${toCode}`}
        />
      </div>

      {/* Row 2: Product, Quantity, Amount, Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <InlineField label="Product" value={product} />
        <InlineField label="Quantity" value={String(quantity)} />
        <InlineField label="Amount" value={`$${invoice.totalAmount.toFixed(2)}`} />
        <div className="flex justify-end">
          <PaymentStatusToggle
            isPaid={invoice.paymentStatus === 'PAID'}
            onChange={(paid) => onStatusChange(invoice.id, paid)}
            disabled={isUpdating}
          />
        </div>
      </div>

      {/* Row 3: Email, Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InlineField label="Email" value={user?.email || 'N/A'} />
        <InlineField label="Contact" value={user?.mobileNumber || 'N/A'} />
      </div>
    </div>
  );
}

// Main Component
export default function NotificationsPage() {
  const { apiFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);

  // Reminder settings
  const [reminderFrequency, setReminderFrequency] = useState<string>('DAILY');
  const [lastReminderSent, setLastReminderSent] = useState<string | null>(null);

  // Pending payments
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch pending invoices
  const fetchPendingInvoices = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/invoices?status=UNPAID&page=${pageNum}&limit=7`);
      if (res.ok) {
        const data = await res.json();
        setPendingInvoices(data.invoices || []);
        setTotalPending(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setPage(pageNum);
      } else {
        toast.error('Failed to load pending payments');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notification?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchPendingInvoices();
    fetchNotifications();
  }, []);

  // Send payment reminders
  const handleSendReminders = async () => {
    setIsSending(true);
    try {
      const res = await apiFetch('/api/notification/send-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: reminderFrequency }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Payment reminders sent to ${data.sentCount || 0} customers`);
        setLastReminderSent(new Date().toISOString());
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send reminders');
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send reminders');
    } finally {
      setIsSending(false);
    }
  };

  // Update payment status
  const handleStatusChange = async (invoiceId: string, paid: boolean) => {
    setUpdatingInvoiceId(invoiceId);
    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: paid ? 'PAID' : 'UNPAID' }),
      });

      if (res.ok) {
        toast.success(paid ? 'Marked as paid' : 'Marked as unpaid');
        // Refresh the list
        fetchPendingInvoices(page);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdatingInvoiceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image */}
      <header className="relative">
        <div className="flex justify-center">
          <img
            src={imgUntitled71.src}
            alt="Notification"
            className="h-64 md:h-80 object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        {/* Section Title */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-medium text-black">NOTIFICATION</h1>
          <div className="w-52 h-1.5 bg-black rounded-full mt-2" />
        </div>

        {/* Reminder Frequency Selection */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-8 md:gap-16 mb-6">
            {REMINDER_FREQUENCIES.map((freq) => (
              <RadioButton
                key={freq.value}
                selected={reminderFrequency === freq.value}
                onClick={() => setReminderFrequency(freq.value)}
                label={freq.label}
              />
            ))}
          </div>

          {/* Send Reminder Button */}
          <button
            onClick={handleSendReminders}
            disabled={isSending}
            className="bg-[#132540] text-white font-semibold px-8 py-3 rounded-[10px] text-lg hover:bg-[#1a3254] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Reminder Send
          </button>

          {/* Last reminder info */}
          {lastReminderSent && (
            <p className="mt-4 text-gray-500 text-lg">
              Last reminder sent - {new Date(lastReminderSent).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })} {new Date(lastReminderSent).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </section>

        {/* Divider */}
        <div className="h-px bg-black mb-8" />

        {/* Pending Payments Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-medium text-black mb-6">
            Pending Payments
          </h2>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#296341]" />
            </div>
          ) : pendingInvoices.length === 0 ? (
            <div className="text-center py-20 bg-[#effaf6] rounded-[10px] border border-[#296341]">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-xl text-gray-600">No pending payments</p>
              <p className="text-gray-400 mt-2">All invoices have been paid</p>
            </div>
          ) : (
            <>
              {/* Pending Payment Cards */}
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <PendingPaymentCard
                    key={invoice.id}
                    invoice={invoice}
                    onStatusChange={handleStatusChange}
                    isUpdating={updatingInvoiceId === invoice.id}
                  />
                ))}
              </div>

              {/* Footer with count and view all */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-gray-600 text-lg">
                  Showing {pendingInvoices.length} of {totalPending} Pending Payment
                </p>

                <button
                  onClick={() => {
                    // Navigate to full invoices page or load more
                    window.location.href = '/cashier?status=UNPAID';
                  }}
                  className="border border-[#296341] text-[#296341] rounded-[10px] px-6 py-2 font-medium hover:bg-[#effaf6] transition-colors flex items-center gap-2"
                >
                  View all Shipments
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </section>

        {/* Bottom spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}