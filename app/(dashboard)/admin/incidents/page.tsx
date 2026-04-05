"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  Loader2,
  Inbox,
  ShieldAlert
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  incidentType: string;
  description: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  date: string;
  time?: string;
  createdAt: string;
  reportedBy: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export default function AdminIncidentsPage() {
  const { apiFetch } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '' });
  const [search, setSearch] = useState('');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      let url = '/api/incidents?limit=100';
      if (filter.status) url += `&status=${filter.status}`;
      if (filter.severity) url += `&severity=${filter.severity}`;
      
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      toast.error("Failed to load incident reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Incident marked as ${newStatus.toLowerCase()}`);
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus as any } : inc));
      }
    } catch (err) {
      toast.error("Failed to update incident status");
    }
  };

  const severityStyles: any = {
    CRITICAL: 'bg-red-600 text-white border-red-600',
    HIGH: 'bg-orange-500 text-white border-orange-500',
    MEDIUM: 'bg-yellow-400 text-black border-yellow-400',
    LOW: 'bg-green-500 text-white border-green-500'
  };

  const statusIcons: any = {
    OPEN: <Clock className="w-4 h-4 text-blue-500" />,
    INVESTIGATING: <Search className="w-4 h-4 text-orange-500" />,
    RESOLVED: <CheckCircle className="w-4 h-4 text-green-500" />,
    CLOSED: <XCircle className="w-4 h-4 text-gray-500" />
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.title.toLowerCase().includes(search.toLowerCase()) || 
    inc.reportedBy.firstName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#132540] flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 text-red-600" /> INCIDENT <span className="text-red-600">REPORTS</span>
            </h1>
            <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-sm">Review and manage safety/operational incidents</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-[#132540] rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-2xl font-black text-[#132540]">{incidents.filter(i => i.status === 'OPEN').length}</span>
                <span className="text-xs font-bold text-gray-400 uppercase leading-none">Open<br/>Incidents</span>
            </div>
            <div className="bg-white border-2 border-red-600 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-2xl font-black text-red-600">{incidents.filter(i => i.severity === 'CRITICAL').length}</span>
                <span className="text-xs font-bold text-red-400 uppercase leading-none">Critical<br/>Issues</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title, description or reporter..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <select 
              className="bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-700 outline-none cursor-pointer"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select 
              className="bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-700 outline-none cursor-pointer"
              value={filter.severity}
              onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
            <p className="text-gray-400 font-black italic tracking-widest uppercase">Fetching reports...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase italic">No Incidents Found</h2>
            <p className="text-gray-400 font-bold max-w-sm mx-auto">Everything seems to be running smoothly. No incident reports match your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest border-2 ${severityStyles[incident.severity]}`}>
                      {incident.severity}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                      {statusIcons[incident.status]}
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider font-mono">{incident.status}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400 tabular-nums bg-gray-50 px-3 py-1 rounded-full uppercase">
                    #{incident.id.slice(-8)}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-[22px] font-black text-[#132540] mb-3 leading-tight group-hover:text-red-600 transition-colors">
                    {incident.title}
                  </h3>
                  <p className="text-gray-500 font-medium line-clamp-3 mb-6 leading-relaxed">
                    {incident.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                    <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{incident.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                    <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Reported At</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{new Date(incident.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#132540]/5 rounded-2xl group-hover:bg-red-50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <User className="w-5 h-5 text-[#132540]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Reported By</p>
                        <p className="text-sm font-bold text-[#132540] truncate">{incident.reportedBy.firstName} {incident.reportedBy.lastName}</p>
                      </div>
                   </div>
                   <button className="p-2 bg-white rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all transform active:scale-90 group-hover:shadow-red-500/20">
                      <ArrowRight className="w-6 h-6" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
