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
import { DashboardBanner } from "@/components/ui/DashboardBanner";
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
      className="flex items-center gap-3 cursor-pointer group w-full sm:w-auto"
    >
      <div className={`w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] rounded-full border-[3px] flex items-center justify-center transition-colors ${selected ? 'border-black bg-black' : 'border-black bg-white group-hover:bg-gray-100'
        }`}>
        {selected && <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white" />}
      </div>
      <span className="text-base sm:text-lg md:text-2xl font-bold text-black uppercase tracking-tight">{label}</span>
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
    <div className="relative bg-white border border-[#296341] rounded-full h-[32px] w-full max-w-[210px] flex items-center overflow-hidden">
      {/* Sliding background */}
      <div
        className={`absolute h-full w-[55%] rounded-full transition-all duration-300 shadow-sm ${isPaid ? 'left-0 bg-green-500' : 'left-[45%] bg-[#ff4747]'
          } border border-black z-0`}
      />
      {/* Labels */}
      <button
        onClick={() => !disabled && onChange(true)}
        disabled={disabled}
        className={`relative z-10 flex-1 text-center text-xs font-black uppercase tracking-widest transition-all ${isPaid ? 'text-white' : 'text-gray-400'
          }`}
      >
        PAID
      </button>
      <button
        onClick={() => !disabled && onChange(false)}
        disabled={disabled}
        className={`relative z-10 flex-1 text-center text-xs font-black uppercase tracking-widest transition-all ${!isPaid ? 'text-white' : 'text-gray-400'
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
    <div className="bg-[#effaf6] border border-[#296341] rounded-xl p-4 sm:p-5 space-y-4 hover:shadow-md transition-all active:scale-[0.99] group border-l-8">
      {/* Row 1: Name, Invoice, Date, Location */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
        <FieldDisplay
          label="Name"
          value={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
        />
        <FieldDisplay
          label="Invoice"
          value={`#${invoice.invoiceNo}`}
        />
        <FieldDisplay
          label="Date"
          value={new Date(invoice.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
          })}
        />
        <FieldDisplay
          label="Route"
          value={`${fromCode} → ${toCode}`}
        />
      </div>

      {/* Row 2: Product, Quantity, Amount, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-t border-[#296341]/10 pt-4">
        <div className="grid grid-cols-3 sm:flex flex-1 gap-4 items-center">
          <InlineField label="Type" value={product} />
          <InlineField label="Qty" value={String(quantity)} />
          <div className="flex items-center gap-1">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Amount:</span>
             <span className="text-sm font-black text-[#132540]">${invoice.totalAmount.toFixed(0)}</span>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end pt-2 sm:pt-0">
          <PaymentStatusToggle
            isPaid={invoice.paymentStatus === 'PAID'}
            onChange={(paid) => onStatusChange(invoice.id, paid)}
            disabled={isUpdating}
          />
        </div>
      </div>

      {/* Row 3: Email, Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-gray-500 pt-1">
        <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#296341]/60" />
            <span className="truncate">{user?.email || 'No email'}</span>
        </div>
        <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#296341]/60" />
            <span>{user?.mobileNumber || 'No contact'}</span>
        </div>
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

  // Automation settings
  const [reminderFrequency, setReminderFrequency] = useState<string>('DAILY');
  const [automationActive, setAutomationActive] = useState<boolean>(false);
  const [lastReminderSent, setLastReminderSent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      const res = await apiFetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch automation settings
  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/notifications/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        if (s.REMINDER_FREQUENCY) setReminderFrequency(s.REMINDER_FREQUENCY);
        if (s.REMINDER_AUTOMATION_ACTIVE) setAutomationActive(s.REMINDER_AUTOMATION_ACTIVE === 'true');
        if (s.REMINDER_LAST_RUN) setLastReminderSent(s.REMINDER_LAST_RUN);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchPendingInvoices();
    fetchNotifications();
    fetchSettings();
  }, []);

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: reminderFrequency,
          automationActive: automationActive
        }),
      });

      if (res.ok) {
        toast.success('Automation preferences saved');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  // Send payment reminders manually
  const handleSendReminders = async () => {
    setIsSending(true);
    try {
      const res = await apiFetch('/api/notifications/send-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: reminderFrequency }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Failed to send reminders";
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || errorMsg;
        } catch (e) {
          if (text.includes("<!DOCTYPE html>")) {
            errorMsg = "Server returned an error page. Please log in again.";
          }
        }
        toast.error(errorMsg);
        setIsSending(false);
        return;
      }

      const data = await res.json();
      toast.success(`Sent to ${data.sentCount || 0} customers`);
      setLastReminderSent(new Date().toISOString());
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
      {/* Standardized Hero Banner */}
      <DashboardBanner 
        imageSrc={imgUntitled71.src} 
        alt="Notification" 
        objectFit="contain"
        className="bg-[#effaf6] mb-0"
      />

      {/* Main Content */}
      <div className="px-4 sm:px-8 md:px-12 max-w-[1400px] mx-auto py-6 sm:py-10">
        {/* Section Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight uppercase">NOTIFICATION CENTER</h1>
          <div className="w-32 sm:w-52 h-1.5 bg-black rounded-full mt-3" />
        </div>

        {/* Automation Settings Section */}
        <section className="mb-12 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[20px] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#132540] flex items-center gap-2 mb-1">
                <Settings className="w-6 h-6 text-gray-400" /> AUTOMATION <span className="text-[#296341]">SETTINGS</span>
              </h2>
              <p className="text-gray-500 font-medium italic">Configure recurring payment reminders</p>
            </div>

            {/* Automation Toggle Switch */}
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm">
              <span className={`text-sm font-black uppercase tracking-widest ${automationActive ? 'text-green-600' : 'text-gray-400'}`}>
                {automationActive ? 'Automation Active' : 'Automation Disabled'}
              </span>
              <button 
                onClick={() => setAutomationActive(!automationActive)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${automationActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${automationActive ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Reminder Frequency</label>
              <div className="flex flex-wrap gap-4 md:gap-8">
                {REMINDER_FREQUENCIES.map((freq) => (
                  <RadioButton
                    key={freq.value}
                    selected={reminderFrequency === freq.value}
                    onClick={() => setReminderFrequency(freq.value)}
                    label={freq.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full sm:w-auto bg-[#132540] text-white font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-[#1a3254] transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Save Preferences
              </button>

              <button
                onClick={handleSendReminders}
                disabled={isSending}
                className="w-full sm:w-auto border-2 border-black text-black font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Manual Send Now
              </button>
            </div>
          </div>

          {/* Last reminder info */}
          {lastReminderSent && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3 text-gray-500 font-medium">
               <Clock className="w-5 h-5 text-gray-400" />
               <span>Last automated send triggered on <strong className="text-gray-900">{new Date(lastReminderSent).toLocaleString('en-GB', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
               })}</strong></span>
            </div>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border-t border-gray-100 pt-6">
                <p className="text-gray-500 text-sm sm:text-lg font-bold">
                  Showing {pendingInvoices.length} of {totalPending} Pending Payments
                </p>

                <button
                  onClick={() => {
                    // Navigate to full invoices page or load more
                    window.location.href = '/cashier?status=UNPAID';
                  }}
                  className="w-full sm:w-auto bg-white border-2 border-[#296341] text-[#296341] rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#effaf6] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                  View all Transactions
                  <ChevronRight className="w-4 h-4 sm:w-5 h-5" />
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