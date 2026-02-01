"use client"

import { useState } from 'react';
import { Plus, Grid3x3, RefreshCw, Trash2, Eye, EyeOff, Search, ChevronDown } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgHero from "@/app/assets/c84df36e65722170900b0920e2cc3eb7cf14fbd0.png";

// Import the pieces from sidebar
import { SidebarProvider, Sidebar, HamburgerButton } from '@/components/sidebar';

const agents = [
  { id: 1, name: 'Henry Rogers', email: 'hendryrogers@demo.com', role: 'Freight Supervisor' },
  { id: 2, name: 'Joseph Fernandes', email: 'jfernandes01@demo.com', role: 'Freight Agent' },
  { id: 3, name: 'Bruno White', email: 'brunowhite@demo.com', role: 'Freight Supervisor' },
];

function AgentManagementContent() {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'change'>('add');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: 'Henry Rogers',
    email: 'hendry123@demo.com',
    password: 'HenryR@011',
    role: 'Freight Supervisor',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: 'HenryR@011',
    newPassword: 'HenryR@000',
  });

  return (
    <div className="min-h-screen bg-white flex flex-col pt-[80px]">
      {/* Sidebar Component */}
      <Sidebar logoSrc={imgLogo.src} />

      {/* Header with Hamburger */}
      <div className="px-8 py-4">
        <HamburgerButton iconSize={48} />
      </div>

      {/* Hero Illustration */}
      <div className="flex justify-center mb-12 px-8">
        <div className="relative w-full max-w-[1000px] aspect-[1000/400] overflow-hidden rounded-xl shadow-lg">
          <img
            src={imgHero.src}
            alt="Agent Management"
            className="w-full h-full object-cover"
          />
          {/* Blurred background effect similar to design */}
          <div className="absolute inset-0 -z-10 blur-2xl opacity-50 scale-110">
            <img src={imgHero.src} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-12 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-[36px] font-bold text-black mb-1">AGENT MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[180px]" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-12 mb-12">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-10 py-2 rounded-[8px] text-[24px] font-medium transition-all ${activeTab === 'add' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            Add Agent
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-10 py-2 rounded-[8px] text-[24px] font-medium transition-all ${activeTab === 'view' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            View Agents
          </button>
          <button
            onClick={() => setActiveTab('change')}
            className={`px-10 py-2 rounded-[8px] text-[24px] font-medium transition-all ${activeTab === 'change' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            Change Password
          </button>
        </div>

        {/* Add New Agent Section */}
        {activeTab === 'add' && (
          <div className="bg-[#e5f7f1] p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Plus className="w-8 h-8 text-[#296341] border-2 border-[#296341] rounded-full" />
              <h2 className="text-[24px] font-medium text-[#296341]">Add New Agent</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-10">
              <div>
                <label className="block text-[22px] font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[22px] font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[22px] font-medium mb-2">Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[22px] font-medium mb-2">Role</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm appearance-none outline-none"
                  >
                    <option>Freight Supervisor</option>
                    <option>Freight Agent</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-6 h-6 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-1 flex items-end">
                <button className="bg-[#132540] text-white px-16 py-2 rounded-[8px] text-[24px] font-medium hover:bg-[#1a3254] transition-colors w-full md:w-auto">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Agents Section */}
        {activeTab === 'view' && (
          <div className="bg-[#e8eff6] p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Grid3x3 className="w-8 h-8 text-[#296341]" />
              <h2 className="text-[24px] font-medium text-[#296341]">View Agents</h2>
            </div>

            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="border border-[#296341] bg-white flex items-center px-6 py-2 rounded-sm shadow-sm"
                >
                  <div className="w-[60px] text-[20px] font-bold">{index + 1}.</div>
                  <div className="w-[300px] text-[18px]">{agent.name}</div>
                  <div className="flex-1 text-[18px] text-center">{agent.email}</div>
                  <div className="w-[300px] text-[18px] flex items-center justify-between px-4">
                    <span>{agent.role}</span>
                    <ChevronDown className="w-6 h-6 text-[#296341]" />
                  </div>
                  <button className="p-2 ml-4 hover:bg-red-50 rounded transition-colors group">
                    <Trash2 className="w-6 h-6 text-[#296341] group-hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {activeTab === 'change' && (
          <div className="bg-[#dcf5f6] p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <RefreshCw className="w-8 h-8 text-[#296341]" />
              <h2 className="text-[24px] font-medium text-[#296341]">Change Password</h2>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-[500px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Agent Name"
                className="w-full border border-[#296341] rounded-[4px] pl-12 pr-4 py-2 text-[18px] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-lg p-10 shadow-lg border border-gray-100">
              {/* User Info Header */}
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-16">
                  <div className="text-[22px] font-medium text-[#296341]">Henry Rogers</div>
                  <div className="text-[22px] font-medium text-[#296341]">hendryrogers@demo.com</div>
                </div>
                <div className="text-[22px] font-medium text-[#296341]">Freight Supervisor</div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-10">
                <div className="flex items-center gap-4">
                  <label className="text-[20px] font-medium whitespace-nowrap min-w-[140px]">Old password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full bg-[#e5f7f1] border border-gray-400 rounded-[4px] px-4 py-2 text-[18px] pr-12 outline-none"
                    />
                    <button
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-[20px] font-medium whitespace-nowrap min-w-[150px]">New password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-[#e5f7f1] border border-gray-400 rounded-[4px] px-4 py-2 text-[18px] pr-12 outline-none"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button className="bg-[#132540] text-white px-16 py-2 rounded-[8px] text-[24px] font-medium hover:bg-[#1a3254] transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[70px]" />
          </div>
          <div className="text-white text-[28px] font-semibold">
            Administration | <span className="font-normal">Cicily Dean</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap with SidebarProvider
export default function AdminAgentManagement() {
  return (
    <SidebarProvider>
      <AgentManagementContent />
    </SidebarProvider>
  );
}