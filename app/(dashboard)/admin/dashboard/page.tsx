"use client";

import { Menu, Search, ChevronDown, Package, DollarSign, Clock, CheckCircle, FileText, Box, Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import imgLogo from "figma:asset/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import imgLogo from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";

/// Mock chart data
const revenueData = [
  { name: 'O-7\nDAYS', value: 2000 },
  { name: '8-14\nDAYS', value: 2200 },
  { name: '15-21\nDAYS', value: 1800 },
  { name: '22-28\nDAYS', value: 2400 },
  { name: '29-35\nDAYS', value: 2500 },
];

// Mock shipment data
const dryShipments = [
  { invoice: '76803', sender: 'Jhon Doe', receiver: 'Smith Jane', item: 'Dry Cargo(S) x 4', payment: 'Cash', amount: '$234.00', status: 'Paid', date: '2024-12-12, 12:45' },
  { invoice: '76799', sender: 'Anni Jane', receiver: 'Smith Jane', item: 'Container 20ft', payment: '------', amount: '$1234.60', status: 'Unpaid', date: '2024-12-12, 12:40' },
  { invoice: '76798', sender: 'Sarah Lee', receiver: 'Emily Davis', item: 'Luggage(M) x 1', payment: 'Online', amount: '$2300.00', status: 'Paid', date: '2024-12-12, 12:20' },
  { invoice: '76797', sender: 'David Clerk', receiver: 'Smith Jane', item: 'Vehicle (BD 2314)', payment: '------', amount: '$200.00', status: 'Unpaid', date: '2024-12-12, 12:18' },
  { invoice: '76791', sender: 'Alice Brown', receiver: 'Emily Davis', item: 'Pallet 4ft(M) x 1', payment: 'Credit Card', amount: '$3000.00', status: 'Paid', date: '2024-12-12, 12:15' },
];

const frozenShipments = [
  { invoice: '76803', sender: 'Jhon Doe', receiver: 'Smith Jane', item: 'Frozen Cargo(S) x 4', payment: 'Cash', amount: '$324.00', status: 'Paid', date: '2024-12-12, 12:45' },
  { invoice: '76799', sender: 'Anni Jane', receiver: 'Smith Jane', item: 'Container 20ft', payment: 'Debit Card', amount: '$1234.60', status: 'Paid', date: '2024-12-12, 12:40' },
  { invoice: '76798', sender: 'Sarah Lee', receiver: 'Emily Davis', item: 'Luggage(M) x 1', payment: 'Credit Card', amount: '$2250.00', status: 'Paid', date: '2024-12-12, 12:20' },
  { invoice: '76797', sender: 'David Clerk', receiver: 'Smith Jane', item: 'Vehicle (BD 2314)', payment: 'Credit Card', amount: '$3000.00', status: 'Paid', date: '2024-12-12, 12:18' },
  { invoice: '76791', sender: 'Alice Brown', receiver: 'Emily Davis', item: 'Pallet 4ft(M) x 1', payment: 'Cash', amount: '$5000.00', status: 'Paid', date: '2024-12-12, 12:15' },
];

const coolerShipments = [
  { invoice: '76803', sender: 'Jhon Doe', receiver: 'Smith Jane', item: 'Frozen Cargo(S) x 4', payment: '-----', amount: '$324.00', status: 'Unpaid', date: '2024-12-12, 12:45' },
  { invoice: '76799', sender: 'Anni Jane', receiver: 'Smith Jane', item: 'Container 20ft', payment: '-----', amount: '$1234.60', status: 'Unpaid', date: '2024-12-12, 12:40' },
  { invoice: '76798', sender: 'Sarah Lee', receiver: 'Emily Davis', item: 'Luggage(M) x 1', payment: '-----', amount: '$2250.00', status: 'Unpaid', date: '2024-12-12, 12:20' },
  { invoice: '76797', sender: 'David Clerk', receiver: 'Smith Jane', item: 'Vehicle (BD 2314)', payment: '-----', amount: '$3000.00', status: 'Unpaid', date: '2024-12-12, 12:18' },
  { invoice: '76791', sender: 'Alice Brown', receiver: 'Emily Davis', item: 'Pallet 4ft(M) x 1', payment: '-----', amount: '$5000.00', status: 'Unpaid', date: '2024-12-12, 12:15' },
];

// Activity items
const activities = [
  { icon: 'file', title: 'Drop-off receipt #AW-1567', subtitle: 'Jhon Doe → Smith Jane', time: '2 min ago' },
  { icon: 'box', title: 'Pick-up completed #AW-1567', subtitle: 'Jhon Doe → Smith Jane', time: '3 min ago' },
  { icon: 'money', title: 'Payment receive $123', subtitle: 'Invoice #PT-2310 → Smith Jane', time: '8 min ago' },
  { icon: 'check', title: 'Dry Cargo inspection Passed', subtitle: 'Cargo #KJ-8901', time: '10 min ago' },
  { icon: 'money', title: 'Payment receive $206', subtitle: 'Invoice #AV-1078 → Smith Jane', time: '18 min ago' },
];

function StatCard({ icon: Icon, title, value, subtitle, positive = true }: any) {
  return (
    <div className="border border-[#296341] rounded-[5px] p-6 flex items-center gap-4">
      <Icon className="w-11 h-11 text-[#296341] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-[20px] leading-tight mb-2">{title}</p>
        <p className="text-[26px] mb-2">{value}</p>
        <p className={`text-[16px] ${positive ? 'text-[#70cf5d]' : 'text-[#cf665d]'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

function ShipmentTable({ title, badge, shipments, showCount }: any) {
  return (
    <div className="border border-[#296341] rounded-[5px] p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] mb-1">{title}</h2>
          <p className="text-[14px] text-[#3b3b3b]">Latest shipment records and status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-6 py-2 rounded-[10px] text-white text-[30px] ${
            badge === 'DRY' ? 'bg-[#296341]' : 
            badge === 'FROZEN' ? 'bg-[#296341]' : 
            'bg-[#296341]'
          }`}>
            {badge}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Printer className="w-10 h-10 text-[#296341]" />
          </button>
        </div>
      </div>

      <div className="bg-[#d4e0d9] border border-[#296341] px-4 py-3 grid grid-cols-[100px_130px_130px_180px_140px_110px_110px_180px] gap-4 mb-4">
        <div className="font-semibold text-[16px]">Invoice</div>
        <div className="font-semibold text-[16px]">Sender</div>
        <div className="font-semibold text-[16px]">Receiver</div>
        <div className="font-semibold text-[16px]">Item Details</div>
        <div className="font-semibold text-[16px]">Payment Mode</div>
        <div className="font-semibold text-[16px]">Amount</div>
        <div className="font-semibold text-[16px] flex items-center gap-2">
          All <ChevronDown className="w-4 h-4" />
        </div>
        <div className="font-semibold text-[16px]">Updated at</div>
      </div>

      {shipments.map((shipment: any, idx: number) => (
        <div key={idx}>
          <div className="px-4 py-3 grid grid-cols-[100px_130px_130px_180px_140px_110px_110px_180px] gap-4 items-center">
            <div className="text-[15px]">{shipment.invoice}</div>
            <div className="text-[15px]">{shipment.sender}</div>
            <div className="text-[15px]">{shipment.receiver}</div>
            <div className="text-[15px]">{shipment.item}</div>
            <div className="text-[15px]">{shipment.payment}</div>
            <div className="text-[15px]">{shipment.amount}</div>
            <div className={`border border-black px-2 py-1 text-center text-[15px] font-bold ${
              shipment.status === 'Paid' ? 'text-[#70cf5d]' : 'text-[#cf5d5d]'
            }`}>
              {shipment.status}
            </div>
            <div className="text-[15px]">{shipment.date}</div>
          </div>
          {idx < shipments.length - 1 && <div className="border-t border-[#5F8A71]" />}
        </div>
      ))}

      <div className="flex items-center justify-between mt-4">
        <p className="text-[14px] text-[#3b3b3b]">Showing {showCount} of 104 Shipments</p>
        <button className="border border-[#296341] rounded-[10px] px-4 py-2 text-[15px] text-[#296341] hover:bg-gray-50">
          View all Shipments →
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#5F8A71] px-8 py-6">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-8">
            <button className="p-2">
              <Menu className="w-[70px] h-[70px] text-[#296341]" />
            </button>
            <div className="flex items-center gap-3">
              <img src={imgLogo} alt="Dean's Shipping Ltd" className="h-12" />
            </div>
          </div>
          
          <div className="flex-1 max-w-[650px] mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#767676]" />
              <input
                type="text"
                placeholder="search shipment, user, invoices..."
                className="w-full border border-[#296341] rounded-[5px] pl-12 pr-4 py-3 text-[18px] text-[#717171]"
              />
            </div>
          </div>

          <div className="border border-[#296341] rounded-[5px] px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            <div>
              <p className="text-[20px]">Cecily Dean</p>
              <p className="text-[18px]">Adminstration</p>
            </div>
            <ChevronDown className="w-6 h-6 text-[#296341]" />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Dashboard Overview */}
        <h1 className="text-[32px] font-semibold text-[#296341] mb-8">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard 
            icon={Package}
            title="Total Shipment Today"
            value="157"
            subtitle="+12% from yesterday"
          />
          <StatCard 
            icon={DollarSign}
            title="Collected Cash Today"
            value="$1570.00"
            subtitle="+22% from yesterday"
          />
          <StatCard 
            icon={DollarSign}
            title="Total Revenue Today"
            value="$5678.00"
            subtitle="+8% from yesterday"
          />
          <StatCard 
            icon={Clock}
            title="Pending Payment"
            value="15"
            subtitle="$1234 total"
            positive={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <StatCard 
            icon={Clock}
            title="Pending Pickup"
            value="27"
            subtitle="20-12-2025"
            positive={false}
          />
          <StatCard 
            icon={CheckCircle}
            title="Completed Pickup"
            value="13"
            subtitle="20-12-2025"
          />
        </div>

        {/* Revenue Chart and Recent Activity */}
        <div className="grid grid-cols-[1fr_436px] gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="border border-[#296341] rounded-[5px] p-6">
            <h2 className="text-[20px] mb-6">REVENUE Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 5000]}
                  ticks={[500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#000" 
                  strokeWidth={2}
                  dot={{ fill: '#000', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="border border-[#296341] rounded-[5px] p-6">
            <div className="mb-6">
              <h2 className="text-[20px] mb-1">Recent Activity</h2>
              <p className="text-[14px] text-[#7b7b7b]">Latest system event</p>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
              {activities.map((activity, idx) => (
                <div key={idx} className="pb-4 border-b border-[#9f9f9f] last:border-0">
                  <div className="flex items-start gap-3">
                    {activity.icon === 'file' && <FileText className="w-7 h-7 text-[#296341] flex-shrink-0" />}
                    {activity.icon === 'box' && <Box className="w-7 h-7 text-[#296341] flex-shrink-0" />}
                    {activity.icon === 'money' && <DollarSign className="w-8 h-8 text-[#296341] flex-shrink-0" />}
                    {activity.icon === 'check' && <CheckCircle className="w-7 h-7 text-[#296341] flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-[16px] mb-1">{activity.title}</p>
                      <p className="text-[12px] mb-1">{activity.subtitle}</p>
                      <p className="text-[10px] text-[#656565]">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipment Tables */}
        <ShipmentTable 
          title="Recent DRY Cargo Shipment"
          badge="DRY"
          shipments={dryShipments}
          showCount="5"
        />

        <ShipmentTable 
          title="Recent Frozen Cargo Shipment"
          badge="FROZEN"
          shipments={frozenShipments}
          showCount="5"
        />

        <ShipmentTable 
          title="Recent Cooler Cargo Shipment"
          badge="COOLER"
          shipments={coolerShipments}
          showCount="5"
        />
      </main>
    </div>
  );
}
