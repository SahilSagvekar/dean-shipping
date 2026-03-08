"use client";

import { useState, useEffect } from 'react';
import { Menu, Search, ChevronDown, Package, DollarSign, Clock, CheckCircle, FileText, Box, Printer, Ship, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
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
    <div className="border border-[#296341] rounded-[5px] p-6 flex items-center gap-4">
      <Icon className="w-11 h-11 text-[#296341] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-[20px] leading-tight mb-2 font-bold">{title}</p>
        <p className="text-[26px] mb-2 font-black">{value}</p>
        <p className={`text-[16px] font-bold ${positive ? 'text-[#70cf5d]' : 'text-[#cf665d]'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

function ShipmentTable({ title, badge, shipments, showCount }: any) {
  return (
    <div className="border border-[#296341] rounded-[5px] p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] mb-1 font-bold italic">{title}</h2>
          <p className="text-[14px] text-[#3b3b3b]">Latest shipment records and status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-6 py-2 rounded-[10px] text-white text-[30px] font-black tracking-tighter bg-[#296341]`}>
            {badge}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded transition-colors active:scale-95">
            <Printer className="w-10 h-10 text-[#296341]" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
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

          {shipments.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-medium">No {badge.toLowerCase()} shipments found.</div>
          ) : (
            shipments.map((shipment: any, idx: number) => {
              // Map API data to UI structure
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
                    <div className="text-[15px] font-bold">{sender}</div>
                    <div className="text-[15px] font-bold">{receiver}</div>
                    <div className="text-[15px] font-medium">{itemsStr}</div>
                    <div className="text-[15px] font-medium">{paymentMode}</div>
                    <div className="text-[15px] font-black">{amount}</div>
                    <div className="flex justify-center">
                      <div className={`border-2 border-black w-full py-1 text-center text-[15px] font-black ${status === 'PAID' || status === 'Paid' ? 'text-[#70cf5d]' : 'text-[#cf5d5d]'
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

      <div className="flex items-center justify-between mt-4">
        <p className="text-[14px] text-[#3b3b3b]">Showing {shipments.length} records</p>
        <button className="border-2 border-[#296341] rounded-[10px] px-6 py-2 text-[15px] font-black text-[#296341] hover:bg-[#296341] hover:text-white transition-all transform active:scale-95">
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiFetch('/api/dashboard/stats');
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
  }, [apiFetch]);

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

  return (
    <div className="bg-white">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-8">
        <h1 className="text-[40px] font-black text-[#296341] mb-8 italic tracking-tighter">
          <span className="border-b-8 border-[#296341]/20">DASHBOARD</span> OVERVIEW
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={Package}
            title="Total Shipment Today"
            value={stats.totalShipmentsToday || "0"}
            subtitle={`${stats.shipmentsChange >= 0 ? '+' : ''}${stats.shipmentsChange || 0}% from yesterday`}
          />
          <StatCard
            icon={DollarSign}
            title="Collected Cash Today"
            value={`$${(stats.cashCollectedToday || 0).toLocaleString()}`}
            subtitle={`${stats.cashChange >= 0 ? '+' : ''}${stats.cashChange || 0}% from yesterday`}
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue Today"
            value={`$${(stats.totalRevenueToday || 0).toLocaleString()}`}
            subtitle={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange || 0}% from yesterday`}
          />
          <StatCard
            icon={Clock}
            title="Pending Payment"
            value={stats.pendingPaymentCount || "0"}
            subtitle={`$${(stats.pendingPaymentTotal || 0).toLocaleString()} total`}
            positive={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

