"use client"

import { useState, useEffect } from 'react';
import { Plus, Grid3x3, RefreshCw, Trash2, Eye, EyeOff, Search, ChevronDown, Loader2 } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgHero from "@/app/assets/c84df36e65722170900b0920e2cc3eb7cf14fbd0.png";
import { toast } from "sonner";

// Sidebar is now handled by (dashboard)/layout.tsx

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  mobileNumber: string;
  role: string;
}

function AgentManagementContent() {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'change'>('view');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'Freight Supervisor',
  });

  const [passwordData, setPasswordData] = useState({
    targetAgentId: '',
    newPassword: '',
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/users?role=AGENT', {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
      });
      const data = await res.json();
      if (res.ok) {
        setAgents(data.users || []);
      } else {
        toast.error(data.error || "Failed to fetch agents");
      }
    } catch (err) {
      toast.error("An error occurred while fetching agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleAddAgent = async () => {
    if (!formData.name || !formData.email || !formData.mobileNumber || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          designation: formData.role,
          role: 'AGENT'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Agent added successfully");
        setFormData({ name: '', email: '', mobileNumber: '', password: '', role: 'Freight Supervisor' });
        fetchAgents();
        setActiveTab('view');
      } else {
        toast.error(data.error || "Failed to add agent");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this agent?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
      });
      if (res.ok) {
        toast.success("Agent deactivated");
        fetchAgents();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to deactivate agent");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.targetAgentId || !passwordData.newPassword) {
      toast.error("Please select an agent and enter a new password");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${passwordData.targetAgentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: passwordData.newPassword })
      });

      if (res.ok) {
        toast.success("Password updated successfully");
        setPasswordData({ targetAgentId: '', newPassword: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update password");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAgents = agents.filter(a =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen flex flex-col">

      {/* Hero Illustration */}
      <div className="flex justify-center mb-6 lg:mb-12 px-4 lg:px-8">
        <div className="relative w-full max-w-[1000px] aspect-[2/1] lg:aspect-[1000/400] overflow-hidden rounded-xl shadow-lg">
          <img
            src={imgHero.src}
            alt="Agent Management"
            className="w-full h-full object-cover"
          />
          {/* Blurred background effect */}
          <div className="absolute inset-0 -z-10 blur-2xl opacity-50 scale-110">
            <img src={imgHero.src} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-[28px] lg:text-[36px] font-bold text-black mb-1">AGENT MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[120px] lg:w-[180px]" />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 lg:gap-12 mb-8 lg:mb-12">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 lg:px-10 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium transition-all ${activeTab === 'add' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            Add Agent
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-6 lg:px-10 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium transition-all ${activeTab === 'view' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            View Agents
          </button>
          <button
            onClick={() => setActiveTab('change')}
            className={`px-6 lg:px-10 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium transition-all ${activeTab === 'change' ? 'bg-[#296341] text-white' : 'bg-[#296341] text-white opacity-90'
              }`}
          >
            Change Password
          </button>
        </div>

        {/* Add New Agent Section */}
        {activeTab === 'add' && (
          <div className="bg-[#e5f7f1] p-6 lg:p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Plus className="w-6 h-6 lg:w-8 lg:h-8 text-[#296341] border-2 border-[#296341] rounded-full" />
              <h2 className="text-[20px] lg:text-[24px] font-medium text-[#296341]">Add New Agent</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 lg:gap-y-8 mb-10">
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Mobile Number</label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="2421234567"
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[18px] lg:text-[22px] font-medium mb-2">Role</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm appearance-none outline-none"
                  >
                    <option>Freight Supervisor</option>
                    <option>Freight Agent</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#296341] w-6 h-6 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={handleAddAgent}
                  disabled={isSubmitting}
                  className="bg-[#132540] text-white px-8 lg:px-16 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium hover:bg-[#1a3254] transition-colors w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Agents Section */}
        {activeTab === 'view' && (
          <div className="bg-[#e8eff6] p-6 lg:p-10 rounded-lg mb-8">
            <div className="flex items-center gap-3 mb-8">
              <Grid3x3 className="w-6 h-6 lg:w-8 lg:h-8 text-[#296341]" />
              <h2 className="text-[20px] lg:text-[24px] font-medium text-[#296341]">View Agents</h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#296341]" />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No agents found.</div>
              ) : (
                filteredAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="border border-[#296341] bg-white flex flex-col lg:flex-row lg:items-center px-4 lg:px-6 py-4 lg:py-2 rounded-sm shadow-sm gap-4"
                  >
                    <div className="flex items-center justify-between lg:contents">
                       <div className="flex items-center gap-2 lg:contents">
                          <div className="w-[30px] lg:w-[60px] text-[16px] lg:text-[20px] font-bold">{index + 1}.</div>
                          <div className="w-[150px] lg:w-[300px] text-[16px] lg:text-[18px]">{agent.firstName} {agent.lastName}</div>
                       </div>
                       <div className="lg:hidden">
                         <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors group"
                          >
                            <Trash2 className="w-6 h-6 text-[#296341] group-hover:text-red-500" />
                          </button>
                       </div>
                    </div>
                    <div className="flex-1 text-[16px] lg:text-[18px] lg:text-center truncate">{agent.email}</div>
                    <div className="w-full lg:w-[300px] text-[16px] lg:text-[18px] flex items-center justify-between px-0 lg:px-4">
                      <span>{agent.designation}</span>
                      <ChevronDown className="w-6 h-6 text-[#296341]" />
                    </div>
                    <div className="hidden lg:block">
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors group"
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

            {/* Search Bar */}
            <div className="relative mb-8 max-w-[500px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Agent Name"
                className="w-full border border-[#296341] rounded-[4px] pl-12 pr-4 py-2 text-[16px] lg:text-[18px] outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-10 shadow-lg border border-gray-100">
              {/* Reset Password Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <label className="block text-[18px] lg:text-[20px] font-medium mb-2">Select Agent</label>
                  <select
                    value={passwordData.targetAgentId}
                    onChange={(e) => setPasswordData({ ...passwordData, targetAgentId: e.target.value })}
                    className="w-full border border-[#296341] rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] bg-white shadow-sm outline-none"
                  >
                    <option value="">Select an agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName} ({agent.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[18px] lg:text-[20px] font-medium mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-[#e5f7f1] border border-gray-400 rounded-[4px] px-4 py-2 text-[16px] lg:text-[18px] pr-12 outline-none"
                      placeholder="Enter new password"
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
                  disabled={isSubmitting}
                  className="bg-[#132540] text-white px-12 lg:px-16 py-2 rounded-[8px] text-[18px] lg:text-[24px] font-medium hover:bg-[#1a3254] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#296341] py-6 lg:py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[50px] lg:h-[70px]" />
          </div>
          <div className="text-white text-[20px] lg:text-[28px] font-semibold text-center">
            Administration | <span className="font-normal">Cicily Dean</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap with SidebarProvider
export default function AdminAgentManagement() {
  return <AgentManagementContent />;
}