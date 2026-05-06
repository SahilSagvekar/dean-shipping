"use client"

import { useState, useEffect } from 'react';
import { Plus, Grid3x3, RefreshCw, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgAdminIcon from "@/app/assets/502abc0f15e7e21e1f5df5c5bb93c870c70bbf38.png";
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  role: string;
}

function AdminManagementContent() {
  const { apiFetch, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'change'>('add');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'ADMIN' as const,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  // Fetch Admins
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/users?role=ADMIN');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.users || []);
      } else {
        toast.error('Failed to load admins');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Error loading administrators');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchAdmins();
    }
  }, [activeTab]);

  // Handle Add Admin
  const handleAddAdmin = async () => {
    if (!formData.firstName || !formData.email || !formData.mobileNumber || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Admin added successfully');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobileNumber: '',
          password: '',
          role: 'ADMIN',
        });
        setActiveTab('view');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add admin');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Admin
  const handleDeleteAdmin = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error('You cannot delete yourself!');
      return;
    }

    if (!confirm('Are you sure you want to delete this administrator?')) return;

    try {
      const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Admin deleted');
        fetchAdmins();
      } else {
        toast.error('Action failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/users/${currentUser?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      if (res.ok) {
        toast.success('Password updated successfully');
        setPasswordData({ oldPassword: '', newPassword: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">

      {/* Admin Management Icon */}
      <div className="flex justify-center mb-6 lg:mb-12 px-4 lg:px-8 pt-4">
        <img
          src={imgAdminIcon.src}
          alt="Admin Management"
          className="w-full max-w-[1000px] h-auto rounded-lg shadow-sm"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12 flex-1 w-full">
        {/* Title */}
        <div className="mb-8 lg:mb-12 text-center lg:text-left">
          <h1 className="text-[28px] lg:text-[36px] font-bold text-black mb-1">ADMIN MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[120px] lg:w-[180px] mx-auto lg:mx-0" />
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-4 lg:gap-12 mb-8 lg:mb-12 justify-center lg:justify-start">
          {[
            { id: 'add', label: 'Add Admin' },
            { id: 'view', label: 'View Admin' },
            { id: 'change', label: 'Change Password' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 lg:px-10 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium transition-all ${activeTab === tab.id ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add New Admin Section */}
        {activeTab === 'add' && (
          <div className="bg-[#e5f7f1] p-6 lg:p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Plus className="w-6 h-6 lg:w-8 lg:h-8 text-[#296341] border-2 border-[#296341] rounded-full" />
              <h2 className="text-[20px] lg:text-[24px] font-medium text-[#296341]">Add New Admin</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 mb-10">
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Mobile Number</label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleAddAdmin}
                disabled={isLoading}
                className="bg-[#132540] text-white px-12 lg:px-16 py-2 rounded-[8px] text-[20px] lg:text-[24px] font-medium hover:bg-[#1a3254] flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        )}

        {/* View Admin Section */}
        {activeTab === 'view' && (
          <div className="bg-[#e8eff6] p-6 lg:p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Grid3x3 className="w-6 h-6 lg:w-8 lg:h-8 text-[#296341]" />
              <h2 className="text-[20px] lg:text-[24px] font-medium text-[#296341]">View Admin</h2>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-[#296341]" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xl">
                  No administrators found.
                </div>
              ) : (
                admins.map((admin, index) => (
                  <div
                    key={admin.id}
                    className="border border-[#296341] bg-white flex flex-col lg:flex-row lg:items-center px-4 lg:px-6 py-4 lg:py-2 rounded-sm shadow-sm gap-2 lg:gap-0"
                  >
                    <div className="flex items-center lg:contents justify-between">
                       <div className="flex items-center lg:contents gap-2">
                          <div className="w-[30px] lg:w-[60px] text-[16px] lg:text-[20px] font-bold">{index + 1}.</div>
                          <div className="w-[150px] lg:w-[380px] text-[16px] lg:text-[18px]">{admin.firstName} {admin.lastName}</div>
                       </div>
                       <div className="lg:hidden">
                         <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors group"
                          >
                            <Trash2 className="w-6 h-6 text-[#296341] group-hover:text-red-500" />
                          </button>
                       </div>
                    </div>
                    <div className="flex-1 text-[16px] lg:text-[18px] truncate lg:px-4">{admin.email}</div>
                    <div className="hidden lg:block">
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors group"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-6 h-6 text-[#296341] group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {activeTab === 'change' && (
          <div className="bg-[#dcf5f6] p-6 lg:p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <RefreshCw className="w-6 h-6 lg:w-8 lg:h-8 text-[#296341]" />
              <h2 className="text-[20px] lg:text-[24px] font-medium text-[#296341]">Change Password</h2>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-10 shadow-lg border border-gray-100">
              {/* User Info Header */}
              <div className="flex flex-col lg:flex-row items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4 lg:gap-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-16 text-center lg:text-left">
                  <div className="text-[18px] lg:text-[22px] font-medium text-[#296341]">{currentUser?.firstName} {currentUser?.lastName}</div>
                  <div className="text-[16px] lg:text-[22px] font-medium text-[#296341] break-all">{currentUser?.email}</div>
                </div>
                <div className="text-[14px] lg:text-[22px] font-black uppercase tracking-widest text-[#296341]/40 px-4 py-1 bg-[#296341]/5 rounded-full">
                  {currentUser?.role}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-[16px] lg:text-[20px] font-medium whitespace-nowrap">Old password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full bg-[#dcf5f6]/50 border border-gray-300 rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] pr-12 focus:border-[#296341] outline-none transition-colors"
                    />
                    <button
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-[16px] lg:text-[20px] font-medium whitespace-nowrap">New password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-[#dcf5f6]/50 border border-gray-300 rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] pr-12 focus:border-[#296341] outline-none transition-colors"
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
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="bg-[#132540] text-white px-12 lg:px-16 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium hover:bg-[#1a3254] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {/* <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[50px] lg:h-[70px]" />
          </div>
          <div className="text-white text-[20px] lg:text-[28px] font-semibold text-center">
            Administration | <span className="font-normal">Cicily Dean</span>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default function AdminManagement() {
  return <AdminManagementContent />;
}