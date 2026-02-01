"use client"

import { useState } from 'react';
import { Plus, Grid3x3, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgAdminIcon from "@/app/assets/502abc0f15e7e21e1f5df5c5bb93c870c70bbf38.png";

// 1. Import the 3 pieces
import { SidebarProvider, Sidebar, HamburgerButton } from '@/components/sidebar';

const admins = [
  { id: 1, name: 'Cecily Dean', email: 'Cecilydean@demo.com' },
  { id: 2, name: 'Ernelia Turnquest', email: 'Erneliaturnquest@demo.com' },
  { id: 3, name: 'Myron Dean', email: 'Myrondean@demo.com' },
];

function AdminManagementContent() {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'change'>('add');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: 'Myron%Dean',
    newPassword: 'MyronDean%',
  });

  return (
    <div className="min-h-screen bg-white flex flex-col pt-[135px]">
      {/* 2. Drop in Sidebar */}
      <Sidebar logoSrc={imgLogo.src} />

      {/* Header - Replace old Menu button with HamburgerButton */}
      <div className="px-8 py-6">
        {/* 3. Replace the old <Menu> icon with HamburgerButton */}
        <HamburgerButton iconSize={60} />
      </div>

      {/* Admin Management Icon */}
      <div className="flex justify-center mb-8">
        <img 
          src={imgAdminIcon.src} 
          alt="Admin Management" 
          className="h-[200px] w-auto blur-[7.5px]"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-8 flex-1">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[40px] font-medium text-black mb-2">ADMIN MANAGEMENT</h1>
          <div className="h-[5px] bg-black rounded-full w-[202px]" />
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-6 mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-8 py-3 rounded-[10px] text-[30px] font-medium shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)] ${
              activeTab === 'add' ? 'bg-[#296341] text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Add Admin
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-8 py-3 rounded-[10px] text-[30px] font-medium shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${
              activeTab === 'view' ? 'bg-[#296341] text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            View Admin
          </button>
          <button
            onClick={() => setActiveTab('change')}
            className={`px-8 py-3 rounded-[10px] text-[30px] font-medium shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${
              activeTab === 'change' ? 'bg-[#296341] text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Add New Admin Section */}
        {activeTab === 'add' && (
          <div className="bg-[#e5f7f1] p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-10 h-10 text-[#296341]" />
              <h2 className="text-[30px] font-medium text-[#296341]">Add New Admin</h2>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <label className="block text-[30px] mb-3">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#296341] rounded-[5px] px-4 py-3 text-[20px]"
                />
              </div>
              <div>
                <label className="block text-[30px] mb-3">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#296341] rounded-[5px] px-4 py-3 text-[20px]"
                />
              </div>
              <div>
                <label className="block text-[30px] mb-3">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-[#296341] rounded-[5px] px-4 py-3 text-[20px]"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button className="bg-[#132540] text-white px-12 py-3 rounded-[10px] text-[30px] font-medium hover:bg-[#1a3254]">
                Save
              </button>
            </div>
          </div>
        )}

        {/* View Admin Section */}
        {activeTab === 'view' && (
          <div className="bg-[#e4ebf4] p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Grid3x3 className="w-10 h-10 text-[#296341]" />
              <h2 className="text-[30px] font-medium text-[#296341]">View Admin</h2>
            </div>

            <div className="space-y-0">
              {admins.map((admin, index) => (
                <div
                  key={admin.id}
                  className="border border-[#296341] bg-white flex items-center px-6 py-3"
                >
                  <div className="w-[60px] text-[26px] font-medium">{index + 1}.</div>
                  <div className="w-[380px] text-[24px]">{admin.name}</div>
                  <div className="flex-1 text-[24px]">{admin.email}</div>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Trash2 className="w-10 h-10 text-[#296341]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {activeTab === 'change' && (
          <div className="bg-[#ddf6f8] p-8 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <RefreshCw className="w-10 h-10 text-[#296341]" />
              <h2 className="text-[30px] font-medium text-[#296341]">Change Password</h2>
            </div>

            <div className="bg-white border border-[#296341] rounded-lg p-6 shadow-lg">
              {/* User Info Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-[28px] font-medium text-[#296341]">Myron Dean</div>
                  <div className="text-[28px] font-medium text-[#296341]">Myrondean@demo.com</div>
                </div>
                <div className="text-[28px] font-medium text-[#296341]">Administration</div>
              </div>

              {/* Password Fields */}
              <div className="flex items-center gap-8 mb-6">
                <div className="flex-1">
                  <label className="block text-[26px] mb-3">Old password:</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full bg-[#ddf6f8] border border-black rounded-[5px] px-4 py-3 text-[24px] pr-12"
                    />
                    <button
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showOldPassword ? (
                        <EyeOff className="w-6 h-6" />
                      ) : (
                        <Eye className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[26px] mb-3">New password:</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-[#ddf6f8] border border-black rounded-[5px] px-4 py-3 text-[24px] pr-12"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-6 h-6" />
                      ) : (
                        <Eye className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button className="bg-[#132540] text-white px-12 py-3 rounded-[10px] text-[30px] font-medium hover:bg-[#1a3254]">
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
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[94px]" />
          </div>
          <div className="text-white text-[40px] font-semibold">
            Administration | <span className="font-normal">Cicily Dean</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap with SidebarProvider
export default function AdminManagement() {
  return (
    <SidebarProvider>
      <AdminManagementContent />
    </SidebarProvider>
  );
}