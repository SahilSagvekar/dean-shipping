"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ChevronDown, Package, DollarSign, Clock, CheckCircle, FileText, Box, Printer, Ship, MapPin, Calendar, Users, ArrowRight, AlertTriangle, ShieldAlert, Download, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/auth-context';
import imgLogo from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";

/// Mock chart data (Still mock for now as backend doesn't provide historical chart data yet)
const revenueData = [
  { name: 'O-7\nDAYS', value: 2000 },
  { name: '8-14\nDAYS', value: 2200 },
  { name: '15-21\nDAYS', value: 1800 },
  { name: '22-28\nDAYS', value: 2400 },
  { name: '29-35\nDAYS', value: 2500 },
];

function StatCard({ icon: Icon, title, value, subtitle, positive = true }: any) {
  return (
    <div className="border border-[#296341]/20 lg:border-[#296341] bg-white rounded-2xl lg:rounded-[5px] p-4 lg:p-6 flex items-center gap-4 shadow-sm hover:shadow-md lg:hover:shadow-none transition-shadow">
      <div className="w-12 h-12 lg:w-11 lg:h-11 bg-[#296341]/10 lg:bg-transparent rounded-xl lg:rounded-none flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 lg:w-11 lg:h-11 text-[#296341]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs lg:text-[20px] text-gray-500 lg:text-black uppercase lg:normal-case font-black lg:font-bold tracking-widest lg:tracking-normal mb-1 lg:mb-2 truncate">
          {title}
        </p>
        <p className="text-xl lg:text-[26px] font-black lg:font-black leading-tight mb-1 lg:mb-2 truncate">
          {value}
        </p>
        <p className={`text-[11px] lg:text-[16px] font-bold px-2 lg:px-0 py-0.5 lg:py-0 rounded-full lg:rounded-none inline-block lg:block ${
          positive ? 'bg-green-100 lg:bg-transparent text-[#296341] lg:text-[#70cf5d]' : 'bg-red-100 lg:bg-transparent text-red-600 lg:text-[#cf665d]'
        }`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ShipmentTable({ title, badge, shipments, showCount }: any) {
  return (
    <div className="border border-[#296341]/20 lg:border-[#296341] bg-white rounded-2xl lg:rounded-[5px] p-4 lg:p-6 mb-8 shadow-sm lg:shadow-none">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg lg:text-[20px] font-black lg:font-bold italic uppercase lg:normal-case tracking-widest lg:tracking-normal text-[#296341] lg:text-black">
            {title}
          </h2>
          <p className="text-xs lg:text-[14px] text-gray-400 lg:text-[#3b3b3b] font-medium lg:font-normal">
            Latest shipment records and status
          </p>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <div className="px-3 lg:px-6 py-1 lg:py-2 rounded-xl lg:rounded-[10px] text-white text-lg lg:text-[30px] font-black tracking-tighter bg-[#296341]">
            {badge}
          </div>
          <button className="p-2 lg:p-0 bg-gray-50 lg:bg-transparent hover:bg-gray-100 lg:hover:bg-transparent rounded-xl lg:rounded-none transition-all active:scale-95 text-[#296341]">
            <Printer className="w-5 lg:w-10 h-5 lg:h-10" />
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-scroll custom-scrollbar">
        <div className="min-w-[1000px]">
          <div className="bg-[#d4e0d9] border border-[#296341] px-4 py-3 grid grid-cols-[100px_130px_130px_180px_140px_110px_110px_180px] gap-4 mb-4">
            <div className="font-bold text-[16px]">Invoice</div>
            <div className="font-bold text-[16px]">Sender</div>
            <div className="font-bold text-[16px]">Receiver</div>
            <div className="font-bold text-[16px]">Item Details</div>
            <div className="font-bold text-[16px]">Payment Mode</div>
            <div className="font-bold text-[16px]">Amount</div>
            <div className="font-bold text-[16px] flex items-center gap-2">
              All <ChevronDown className="w-4 h-4" />
            </div>
            <div className="font-bold text-[16px]">Updated at</div>
          </div>

          <div className="space-y-0">
            {shipments.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-medium">No {badge.toLowerCase()} shipments found.</div>
            ) : (
              shipments.map((shipment: any, idx: number) => {
                const invoiceNo = shipment.invoiceNo || shipment.invoice || 'N/A';
                const sender = shipment.user ? `${shipment.user.firstName} ${shipment.user.lastName}` : (shipment.contactName || 'N/A');
                const receiver = shipment.contactName || 'N/A';
                const itemsStr = shipment.items?.map((i: any) => i.itemType).join(', ') || shipment.item || 'N/A';
                const paymentMode = shipment.invoice?.paymentMode || shipment.payment || '---';
                const amount = `$${(shipment.totalAmount || 0).toLocaleString()}`;
                const status = shipment.paymentStatus || shipment.status || 'Unpaid';
                const date = shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleString() : (shipment.date || 'N/A');

                return (
                  <div key={idx}>
                    <div className="px-4 py-3 grid grid-cols-[100px_130px_130px_180px_140px_110px_110px_180px] gap-4 items-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="text-[15px] font-black italic">#{invoiceNo}</div>
                      <div className="text-[15px] font-bold truncate">{sender}</div>
                      <div className="text-[15px] font-bold truncate">{receiver}</div>
                      <div className="text-[15px] font-medium truncate">{itemsStr}</div>
                      <div className="text-[15px] font-medium">{paymentMode}</div>
                      <div className="text-[15px] font-black">{amount}</div>
                      <div className="flex justify-center">
                        <div className={`border-2 border-black w-full py-1 text-center text-[11px] font-black tracking-widest uppercase ${status === 'PAID' || status === 'Paid' ? 'text-[#70cf5d]' : 'text-[#cf5d5d]'
                          }`}>
                          {status}
                        </div>
                      </div>
                      <div className="text-[15px] font-medium opacity-60">{date}</div>
                    </div>
                    {idx < shipments.length - 1 && <div className="border-t border-[#d4e0d9]" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {shipments.length === 0 ? (
          <div className="py-12 text-center text-gray-300 font-black italic tracking-widest uppercase">No {badge.toLowerCase()} shipments found.</div>
        ) : (
          shipments.map((shipment: any, idx: number) => {
            const invoiceNo = shipment.invoiceNo || shipment.invoice || 'N/A';
            const sender = shipment.user ? `${shipment.user.firstName} ${shipment.user.lastName}` : (shipment.contactName || 'N/A');
            const receiver = shipment.contactName || 'N/A';
            const itemsStr = shipment.items?.map((i: any) => i.itemType).join(', ') || shipment.item || 'N/A';
            const paymentMode = shipment.invoice?.paymentMode || shipment.payment || '---';
            const amount = `$${(shipment.totalAmount || 0).toLocaleString()}`;
            const status = shipment.paymentStatus || shipment.status || 'Unpaid';
            const isPaid = status === 'PAID' || status === 'Paid';
            const date = shipment.updatedAt ? new Date(shipment.updatedAt).toLocaleString() : (shipment.date || 'N/A');

            return (
              <div key={idx} className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#296341] text-white px-3 py-1 rounded-lg text-sm font-black italic">#{invoiceNo}</div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPaid ? 'border-green-200 text-green-700 bg-green-50' : 'border-red-100 text-red-600 bg-red-50'}`}>
                        {status}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 tabular-nums">{date.split(',')[0]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Sender</p>
                      <p className="text-[13px] font-bold text-gray-800 truncate">{sender}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Receiver</p>
                      <p className="text-[13px] font-bold text-gray-800 truncate">{receiver}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] text-gray-400 font-black uppercase">Details: {paymentMode}</span>
                       <span className="text-[16px] font-black text-[#296341]">{amount}</span>
                    </div>
                    <p className="text-[12px] font-bold text-gray-500 truncate">{itemsStr}</p>
                  </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4 lg:gap-0 border-t lg:border-none border-gray-100 pt-6 lg:pt-0">
        <p className="text-[14px] text-gray-400 lg:text-[#3b3b3b] font-bold lg:font-normal uppercase lg:normal-case tracking-widest lg:tracking-normal">
          Showing {shipments.length} records
        </p>
        <button className="w-full lg:w-auto bg-[#296341] lg:bg-transparent border-2 border-[#296341] text-white lg:text-[#296341] rounded-xl lg:rounded-[10px] px-8 py-3.5 lg:py-2 text-[15px] font-black hover:bg-[#1e4c30] lg:hover:bg-[#296341] lg:hover:text-white transition-all transform active:scale-95 shadow-xl lg:shadow-none shadow-[#296341]/20">
          View all Shipments
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { apiFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('today');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/dashboard/stats?range=${range}`);
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiFetch, range]);

  const exportToCSV = () => {
    if (!data?.allRecentShipments) return;
    
    const headers = ['Invoice', 'Date', 'Sender', 'Receiver', 'Type', 'Status', 'Amount', 'Payment Mode'];
    const rows = data.allRecentShipments.map((s: any) => [
      s.invoiceNo,
      new Date(s.createdAt).toLocaleDateString(),
      `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
      s.contactName || 'N/A',
      s.type || 'N/A',
      s.paymentStatus || 'N/A',
      s.totalAmount || 0,
      s.invoice?.paymentMode || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.map((c: any) => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dean_shipping_dashboard_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#296341] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#296341] text-lg font-black tracking-widest italic animate-pulse">SYNCING DATA...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentShipments = data?.recentShipments || { dry: [], frozen: [], cooler: [] };
  const recentActivity = data?.recentActivity || [];
  const upcomingVoyages = data?.upcomingVoyages || [];
  const recentIncidents = data?.recentIncidents || [];

  return (
    <div className="bg-white">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <h1 className="text-[40px] font-black text-[#296341] italic tracking-tighter">
            <span className="border-b-8 border-[#296341]/20">DASHBOARD</span> OVERVIEW
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Range Filters */}
            <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
              {[
                { label: 'Today', value: 'today' },
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setRange(item.value)}
                  className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    range === item.value 
                      ? 'bg-[#296341] text-white shadow-lg shadow-[#296341]/30 -translate-y-0.5' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-white border-2 border-[#296341] text-[#296341] px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#296341] hover:text-white transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#296341] text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#1e4c30] transition-all active:scale-95 shadow-lg shadow-[#296341]/30"
              >
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Package}
            title={`Total Shipment ${range === 'today' ? 'Today' : `(${range.toUpperCase()})`}`}
            value={stats.totalShipmentsToday || "0"}
            subtitle={`${stats.shipmentsChange >= 0 ? '+' : ''}${stats.shipmentsChange || 0}% from prev. period`}
          />
          <StatCard
            icon={DollarSign}
            title={`Collected Cash ${range === 'today' ? 'Today' : `(${range.toUpperCase()})`}`}
            value={`$${(stats.cashCollectedToday || 0).toLocaleString()}`}
            subtitle={`${stats.cashChange >= 0 ? '+' : ''}${stats.cashChange || 0}% from prev. period`}
          />
          <StatCard
            icon={DollarSign}
            title={`Total Revenue ${range === 'today' ? 'Today' : `(${range.toUpperCase()})`}`}
            value={`$${(stats.totalRevenueToday || 0).toLocaleString()}`}
            subtitle={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange || 0}% from prev. period`}
          />
          <StatCard
            icon={Clock}
            title="Pending Payment"
            value={stats.pendingPaymentCount || "0"}
            subtitle={`$${(stats.pendingPaymentTotal || 0).toLocaleString()} total`}
            positive={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Pending Pickup"
            value={stats.pendingPickups || "0"}
            subtitle="Current active orders"
            positive={false}
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Pickup"
            value={stats.completedPickups || "0"}
            subtitle="Today's deliveries"
          />
          <StatCard
            icon={AlertTriangle}
            title="Active Incidents"
            value={stats.openIncidentsCount || "0"}
            subtitle="Require attention"
            positive={false}
          />
        </div>

        {/* Revenue Chart and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_436px] gap-6 mb-8">
          <div className="border border-[#296341] rounded-[5px] p-6 bg-white shadow-sm">
            <h2 className="text-[20px] font-black italic mb-6 uppercase tracking-widest text-[#296341]">REVENUE Chart</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                    domain={[0, 5000]}
                    ticks={[500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '2px solid #296341', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#296341"
                    strokeWidth={4}
                    dot={{ fill: '#296341', r: 6, stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border border-[#296341] rounded-[5px] p-6 bg-white shadow-sm">
            <div className="mb-6">
              <h2 className="text-[20px] font-black italic mb-1 uppercase tracking-widest text-[#296341]">Recent Activity</h2>
              <p className="text-[14px] text-[#7b7b7b] font-medium">Latest system events</p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-bold italic">No recent activity</div>
              ) : (
                recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-[#d4e0d9] last:border-0 hover:bg-gray-50 transition-colors rounded p-2">
                    <div className="flex items-start gap-4">
                      {activity.action.includes('BOOKING') && <Package className="w-8 h-8 text-[#296341] flex-shrink-0" />}
                      {activity.action.includes('PAYMENT') || activity.action.includes('INVOICE') ?
                        <DollarSign className="w-8 h-8 text-[#296341] flex-shrink-0" /> :
                        <FileText className="w-8 h-8 text-[#296341] flex-shrink-0" />
                      }
                      <div className="flex-1">
                        <p className="text-[16px] font-black text-[#1a365d] mb-1">{activity.action.replace(/_/g, ' ')}</p>
                        <p className="text-[12px] font-bold text-gray-600 mb-1">
                          {activity.entity.replace(/_/g, ' ')}: {activity.entityId || '---'}
                          {activity.user && <span className="block italic text-[10px]">By: {activity.user.firstName} {activity.user.lastName}</span>}
                        </p>
                        <p className="text-[10px] font-black text-[#296341] opacity-60">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Voyages */}
        {upcomingVoyages.length > 0 && (
          <div className="border border-[#296341] rounded-[5px] p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[20px] font-black italic mb-1 uppercase tracking-widest text-[#296341]">
                  Upcoming Voyages
                </h2>
                <p className="text-[14px] text-[#7b7b7b] font-medium">Next scheduled departures with stops</p>
              </div>
              <Ship className="w-10 h-10 text-[#296341]" />
            </div>
            <div className="space-y-3">
              {upcomingVoyages.map((voyage: any, idx: number) => {
                const dateStr = new Date(voyage.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const routeStr = voyage.stops && voyage.stops.length > 0
                  ? voyage.stops.map((s: any) => s.location.code).join(' → ')
                  : `${voyage.from?.code || '?'} → ${voyage.to?.code || '?'}`;
                const cargoCount = voyage._count?.cargoBookings || 0;
                const paxCount = voyage._count?.passengerBookings || 0;

                return (
                  <div
                    key={voyage.id}
                    className="flex items-center gap-4 bg-[#e5f7f1] border border-[#296341]/30 rounded-xl px-5 py-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-[#296341] rounded-xl flex flex-col items-center justify-center text-white">
                      <Ship className="w-6 h-6" />
                      <span className="text-[10px] font-bold mt-0.5">#{voyage.voyageNo}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[16px] font-black text-[#1a365d]">{voyage.shipName}</span>
                        <span className="text-[14px] text-gray-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[13px] font-bold text-[#296341]">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{routeStr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-center flex-shrink-0">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Cargo</p>
                        <p className="text-[18px] font-black text-[#296341]">{cargoCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Pax</p>
                        <p className="text-[18px] font-black text-purple-700">{paxCount}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Incident Reports Section */}
        {recentIncidents.length > 0 && (
          <div className="border-2 border-red-500/20 bg-red-50/10 rounded-[5px] p-6 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-[20px] font-black italic mb-1 uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6" /> Recent Incident Reports
                </h2>
                <p className="text-[14px] text-gray-500 font-medium">Unresolved safety and operational issues</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-1 bg-red-600 text-white rounded-full text-sm font-black uppercase tracking-wider">
                  High Priority
                </div>
                <Link href="/admin/incidents" className="flex items-center gap-2 text-red-600 font-black uppercase text-xs hover:underline decoration-2">
                  View All Reports <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentIncidents.map((incident: any) => {
                const severityColors: any = {
                  CRITICAL: 'bg-red-600 text-white',
                  HIGH: 'bg-orange-500 text-white',
                  MEDIUM: 'bg-yellow-400 text-black',
                  LOW: 'bg-blue-400 text-white'
                };
                return (
                  <div key={incident.id} className="bg-white border border-red-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${severityColors[incident.severity] || severityColors.MEDIUM}`}>
                        {incident.severity}
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{incident.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium h-10">
                      {incident.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black">
                          {incident.reportedBy?.firstName[0]}
                        </div>
                        <span className="text-[12px] font-bold text-gray-600">{incident.reportedBy?.firstName} {incident.reportedBy?.lastName}</span>
                      </div>
                      <span className="text-[12px] font-black text-[#296341] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shipment Tables */}
        <ShipmentTable
          title="Recent DRY Cargo Shipment"
          badge="DRY"
          shipments={recentShipments.dry}
          showCount={recentShipments.dry.length}
        />

        <ShipmentTable
          title="Recent Frozen Cargo Shipment"
          badge="FROZEN"
          shipments={recentShipments.frozen}
          showCount={recentShipments.frozen.length}
        />

        <ShipmentTable
          title="Recent Cooler Cargo Shipment"
          badge="COOLER"
          shipments={recentShipments.cooler}
          showCount={recentShipments.cooler.length}
        />
      </main>
    </div>
  );
}

