"use client"

import { useState } from 'react';
import { Plus, Grid3x3, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgAdminIcon from "@/app/assets/502abc0f15e7e21e1f5df5c5bb93c870c70bbf38.png";

// Sidebar is now handled by (dashboard)/layout.tsx


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
    <div className="bg-white">

      {/* Sidebar and Hamburger are now handled by (dashboard)/layout.tsx */}



      {/* Admin Management Icon */}
      <div className="flex justify-center mb-8 px-8">
        <img
          src={imgAdminIcon.src}
          alt="Admin Management"
          className="w-full max-w-[1000px] h-auto rounded-lg shadow-sm"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-8 flex-1">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-[36px] font-bold text-black mb-1">ADMIN MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[180px]" />
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-12 mb-12">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-10 py-2 rounded-[8px] text-[24px] font-medium transition-colors ${activeTab === 'add' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            Add Admin
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-10 py-2 rounded-[8px] text-[24px] font-medium transition-colors ${activeTab === 'view' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            View Admin
          </button>
          <button
            onClick={() => setActiveTab('change')}
            className={`px-10 py-2 rounded-[8px] text-[24px] font-medium transition-colors ${activeTab === 'change' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            Change Password
          </button>
        </div>

        {/* Add New Admin Section */}
        {activeTab === 'add' && (
          <div className="bg-[#e5f7f1] p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Plus className="w-8 h-8 text-[#296341] border-2 border-[#296341] rounded-full" />
              <h2 className="text-[24px] font-medium text-[#296341]">Add New Admin</h2>
            </div>

            <div className="grid grid-cols-3 gap-12 mb-10">
              <div>
                <label className="block text-[22px] font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[22px] font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[22px] font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[18px] bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button className="bg-[#132540] text-white px-16 py-2 rounded-[8px] text-[24px] font-medium hover:bg-[#1a3254]">
                Save
              </button>
            </div>
          </div>
        )}

        {/* View Admin Section */}
        {activeTab === 'view' && (
          <div className="bg-[#e8eff6] p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Grid3x3 className="w-8 h-8 text-[#296341]" />
              <h2 className="text-[24px] font-medium text-[#296341]">View Admin</h2>
            </div>

            <div className="space-y-4">
              {admins.map((admin, index) => (
                <div
                  key={admin.id}
                  className="border border-[#296341] bg-white flex items-center px-6 py-2 rounded-sm shadow-sm"
                >
                  <div className="w-[60px] text-[20px] font-bold">{index + 1}.</div>
                  <div className="w-[380px] text-[18px]">{admin.name}</div>
                  <div className="flex-1 text-[18px]">{admin.email}</div>
                  <button className="p-2 hover:bg-red-50 rounded transition-colors group">
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

            <div className="bg-white rounded-lg p-10 shadow-lg border border-gray-100">
              {/* User Info Header */}
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-16">
                  <div className="text-[22px] font-medium text-[#296341]">Myron Dean</div>
                  <div className="text-[22px] font-medium text-[#296341]">Myrondean@demo.com</div>
                </div>
                <div className="text-[22px] font-medium text-[#296341]">Administration</div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-16 mb-10">
                <div className="flex items-center gap-4">
                  <label className="text-[20px] font-medium whitespace-nowrap">Old password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full bg-[#dcf5f6] border border-gray-300 rounded-[4px] px-4 py-2 text-[18px] pr-12"
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
                  <label className="text-[20px] font-medium whitespace-nowrap">New password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-[#dcf5f6] border border-gray-300 rounded-[4px] px-4 py-2 text-[18px] pr-12"
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
                <button className="bg-[#132540] text-white px-16 py-2 rounded-[8px] text-[24px] font-medium hover:bg-[#1a3254]">
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
export default function AdminManagement() {
  return <AdminManagementContent />;
}