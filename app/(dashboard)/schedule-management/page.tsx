"use client"

import { useState, useEffect } from 'react';
import { MapPin, Check, ChevronDown, Plus, Trash2, Edit2, Loader2, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgHero from "@/app/assets/b493fe526d34a8d0e654480300ff88ab45d2dde1.png";
import imgShipBg from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";
import { useAuth } from "@/lib/auth-context";

// Types
interface ScheduleEvent {
  id?: string;
  location: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string;
  sortOrder?: number;
}

interface Schedule {
  id: string;
  date: string;
  weekday: string;
  month: string;
  shipName: string;
  isHoliday: boolean;
  isPublished: boolean;
  isLaunched: boolean;
  launchAt: string | null;
  events: ScheduleEvent[];
}

// Event types dropdown options
const eventTypes = [
  "Freight Drop Off",
  "Freight Pick Up",
  "Passenger Boarding",
  "Maintenance",
  "Special Service"
];

// Schedule Item Display Component
function ScheduleItem({ data, onEdit }: { data: Schedule; onEdit: () => void }) {
  if (data.isHoliday) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 cursor-pointer hover:bg-white/10 transition-colors" onClick={onEdit}>
        <span className="text-[32px] font-extrabold text-white tracking-wider">Holiday</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center p-6 space-y-4 cursor-pointer hover:bg-white/10 transition-colors" onClick={onEdit}>
      {data.events.length === 0 ? (
        <div className="text-white/60 text-center">
          <Plus className="w-8 h-8 mx-auto mb-2" />
          <span>Click to add events</span>
        </div>
      ) : (
        data.events.map((event, idx) => (
          <div key={idx} className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 fill-white text-white" />
              <span className="text-[22px] font-bold">{event.location}</span>
              {(event.startTime || event.endTime) && (
                <span className="text-[22px] font-bold ml-2">
                  ({event.startTime}{event.startTime && event.endTime ? " - " : ""}{event.endTime})
                </span>
              )}
            </div>
            <div className="pl-7">
              <p className="text-[20px] font-bold leading-tight">{event.type}</p>
              {event.notes && <p className="text-[16px] font-medium opacity-90">{event.notes}</p>}
            </div>
          </div>
        ))
      )}

      {/* Status indicators */}
      <div className="flex gap-2 mt-2">
        {data.isPublished && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Published</span>
        )}
        {data.launchAt && !data.isLaunched && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        )}
      </div>
    </div>
  );
}

// Edit Modal Component
function EditScheduleModal({
  schedule,
  onClose,
  onSave,
  locations
}: {
  schedule: Schedule;
  onClose: () => void;
  onSave: (data: Partial<Schedule>) => Promise<void>;
  locations: { code: string; name: string }[];
}) {
  const [isHoliday, setIsHoliday] = useState(schedule.isHoliday);
  const [events, setEvents] = useState<ScheduleEvent[]>(schedule.events || []);
  const [isSaving, setIsSaving] = useState(false);

  const addEvent = () => {
    setEvents([...events, { location: locations[0]?.code || "", startTime: "", endTime: "", type: eventTypes[0], notes: "" }]);
  };

  const updateEvent = (index: number, field: keyof ScheduleEvent, value: string) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    setEvents(updated);
  };

  const updateTime = (index: number, field: "startTime" | "endTime", type: "value" | "ampm", newValue: string) => {
    const updated = [...events];
    const current = updated[index][field] || "";
    const [val, ampm] = current.split(" ");

    let result = "";
    if (type === "value") {
      result = `${newValue} ${ampm || "AM"}`;
    } else {
      result = `${val || ""} ${newValue}`;
    }

    updated[index] = { ...updated[index], [field]: result.trim() };
    setEvents(updated);
  };

  const getTimeParts = (timeStr: string) => {
    if (!timeStr) return { value: "", ampm: "AM" };
    const [value, ampm] = timeStr.split(" ");
    return { value: value || "", ampm: ampm || "AM" };
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        isHoliday,
        events: isHoliday ? [] : events,
      });
      onClose();
    } catch (err) {
      alert("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#296341] p-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h3 className="text-white text-2xl font-bold">{schedule.shipName}</h3>
            <p className="text-white/80">{schedule.weekday}, {schedule.date} {schedule.month}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Holiday Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-5 h-5 accent-[#296341]"
              />
              <span className="text-lg font-medium">Mark as Holiday</span>
            </label>
          </div>

          {/* Events Editor */}
          {!isHoliday && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">Events</h4>
                <button
                  onClick={addEvent}
                  className="bg-[#296341] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1e4a2e]"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No events. Click "Add Event" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Event {index + 1}</span>
                        <button
                          onClick={() => removeEvent(index)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <select
                            value={event.location}
                            onChange={(e) => updateEvent(index, "location", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          >
                            {locations.map(loc => (
                              <option key={loc.code} value={loc.code}>{loc.name} ({loc.code})</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Start Time</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getTimeParts(event.startTime).value}
                                onChange={(e) => updateTime(index, "startTime", "value", e.target.value)}
                                placeholder="e.g., 8"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                              <select
                                value={getTimeParts(event.startTime).ampm}
                                onChange={(e) => updateTime(index, "startTime", "ampm", e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-50"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">End Time</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getTimeParts(event.endTime).value}
                                onChange={(e) => updateTime(index, "endTime", "value", e.target.value)}
                                placeholder="e.g., 3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                              <select
                                value={getTimeParts(event.endTime).ampm}
                                onChange={(e) => updateTime(index, "endTime", "ampm", e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-50"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={event.type}
                            onChange={(e) => updateEvent(index, "type", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          >
                            {eventTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Notes</label>
                          <input
                            type="text"
                            value={event.notes}
                            onChange={(e) => updateEvent(index, "notes", e.target.value)}
                            placeholder="e.g., Dry Freight Only"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#132540] text-white px-6 py-2 rounded-lg hover:bg-[#1a3254] disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleManagementContent() {
  const { user, apiFetch } = useAuth();

  // Helper to get local YYYY-MM-DD
  const toLocalISO = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // State
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [locations, setLocations] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    return new Date(now.setDate(diff));
  });

  // Edit modal
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Schedule launch
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("00:00");
  const [isLaunching, setIsLaunching] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 6; i++) { // Mon-Sat
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Fetch locations
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await apiFetch("/api/locations");
        const data = await res.json();
        if (data.locations) {
          setLocations(data.locations.map((l: any) => ({ code: l.code, name: l.name })));
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    }
    fetchLocations();
  }, [apiFetch]);

  // Fetch schedules for current week
  useEffect(() => {
    async function fetchSchedules() {
      setIsLoading(true);
      setError("");
      try {
        const startDate = toLocalISO(weekDates[0]);
        const endDate = toLocalISO(weekDates[5]);

        const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
        const data = await res.json();

        if (res.ok) {
          setSchedules(data.schedules || []);
        } else {
          setError(data.error || "Failed to fetch schedules");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedules();
  }, [currentWeekStart, apiFetch]);

  // Get schedule for specific date and ship
  const getSchedule = (date: Date, shipName: string): Schedule | null => {
    const dateStr = toLocalISO(date);
    return schedules.find(s => {
      const sDateStr = toLocalISO(new Date(s.date));
      return sDateStr === dateStr && s.shipName === shipName;
    }) || null;
  };

  // Create or get schedule for editing
  const handleEditClick = async (date: Date, shipName: string) => {
    let schedule = getSchedule(date, shipName);

    if (!schedule) {
      // Create a new schedule entry
      const dateStr = toLocalISO(date);
      const weekday = weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const month = months[date.getMonth()];

      try {
        const res = await apiFetch("/api/schedules", {
          method: "POST",
          body: JSON.stringify({
            date: dateStr,
            weekday,
            month,
            shipName,
            isHoliday: false,
            events: [],
          }),
        });

        const data = await res.json();
        if (res.ok) {
          schedule = data.schedule;
          setSchedules([...schedules, data.schedule]);
        } else {
          alert(data.error || "Failed to create schedule");
          return;
        }
      } catch (err) {
        alert("Failed to create schedule");
        return;
      }
    }

    setEditingSchedule(schedule);
  };

  // Save schedule changes
  const handleSaveSchedule = async (updates: Partial<Schedule>) => {
    if (!editingSchedule) return;

    const res = await apiFetch(`/api/schedules/${editingSchedule.id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to save");
    }

    // Update local state
    setSchedules(schedules.map(s =>
      s.id === editingSchedule.id ? data.schedule : s
    ));
  };

  // Launch all schedules now
  const handleLaunchNow = async () => {
    if (!confirm("This will publish all schedules for this week and create voyages. Continue?")) return;

    setIsLaunching(true);
    try {
      // Step 1: Update all schedules to published
      const scheduleIds: string[] = [];
      for (const schedule of schedules) {
        await apiFetch(`/api/schedules/${schedule.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublished: true, isLaunched: true }),
        });
        scheduleIds.push(schedule.id);
      }

      // Step 2: Auto-create voyages from the published schedules
      try {
        const voyageRes = await apiFetch("/api/schedules/create-voyages", {
          method: "POST",
          body: JSON.stringify({ scheduleIds }),
        });
        const voyageData = await voyageRes.json();
        if (voyageRes.ok && voyageData.voyages?.length > 0) {
          alert(
            `Schedules published successfully!\n\n` +
            `${voyageData.voyages.length} voyage(s) created:\n` +
            voyageData.voyages
              .map((v: any) => `• Voyage #${v.voyageNo} — ${v.shipName} (${v.stops?.length || 0} stops)`)
              .join("\n")
          );
        } else if (voyageRes.ok) {
          alert("Schedules published successfully!\n\nNo new voyages were created (may already exist or schedules have no events).");
        } else {
          // Schedules were published but voyage creation had an issue
          alert(`Schedules published, but voyage creation had an issue: ${voyageData.error || "Unknown error"}`);
        }
      } catch (voyageErr) {
        // Schedules were still published even if voyage creation fails
        console.error("Voyage creation error:", voyageErr);
        alert("Schedules published successfully!\n\nNote: Automatic voyage creation encountered an error. You can create voyages manually.");
      }

      // Refresh schedules
      const startDate = toLocalISO(weekDates[0]);
      const endDate = toLocalISO(weekDates[5]);
      const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
      const data = await res.json();
      if (res.ok) {
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      alert("Failed to publish schedules");
    } finally {
      setIsLaunching(false);
    }
  };

  // Schedule for later
  const handleScheduleLaunch = async () => {
    if (!launchDate || !launchTime) {
      alert("Please select date and time");
      return;
    }

    const launchAt = new Date(`${launchDate}T${launchTime}`);

    if (launchAt <= new Date()) {
      alert("Please select a future date and time");
      return;
    }

    if (!confirm(`Schedule all changes to launch on ${launchAt.toLocaleString()}?`)) return;

    setIsScheduling(true);
    try {
      // Update all schedules with launchAt
      for (const schedule of schedules) {
        await apiFetch(`/api/schedules/${schedule.id}`, {
          method: "PATCH",
          body: JSON.stringify({ launchAt: launchAt.toISOString() }),
        });
      }

      // Refresh schedules
      const res = await apiFetch(`/api/schedules?limit=100`);
      const data = await res.json();
      if (res.ok) {
        setSchedules(data.schedules || []);
      }

      alert(`Schedules will be published on ${launchAt.toLocaleString()}`);
    } catch (err) {
      alert("Failed to schedule launch");
    } finally {
      setIsScheduling(false);
    }
  };

  // Navigate weeks
  const prevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  return (
    <div className="bg-white">
      {/* Hero Illustration */}
      <div className="flex justify-center mb-12 px-8">
        <img
          src={imgHero.src}
          alt="Schedule Planning"
          className="w-full max-w-[900px] h-auto"
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 pb-12 flex-1 w-full">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[36px] font-bold text-black mb-1">SCHEDULE MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[180px]" />
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={prevWeek}
            className="px-6 py-2 border border-[#296341] text-[#296341] rounded-lg hover:bg-[#296341] hover:text-white transition-colors"
          >
            ← Previous Week
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[5].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          <button
            onClick={nextWeek}
            className="px-6 py-2 border border-[#296341] text-[#296341] rounded-lg hover:bg-[#296341] hover:text-white transition-colors"
          >
            Next Week →
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
          </div>
        ) : (
          <>
            {/* Schedule Grid with Ship Background */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img src={imgShipBg.src} alt="" className="w-full h-full object-cover brightness-[0.4]" />
              </div>

              <div className="relative z-10">
                {/* Table Header */}
                <div className="grid grid-cols-[180px_1fr_1fr] bg-black/20 backdrop-blur-sm border-b border-white/20">
                  <div className="py-4 text-center">
                    <span className="text-white text-lg font-medium">Click to edit</span>
                  </div>
                  <div className="py-8 text-center">
                    <h2 className="text-[48px] font-bold text-white tracking-[0.2em]">SHIP A</h2>
                  </div>
                  <div className="py-8 text-center border-l border-white/20">
                    <h2 className="text-[48px] font-bold text-white tracking-[0.2em]">SHIP B</h2>
                  </div>
                </div>

                {/* Schedule Rows */}
                <div className="divide-y divide-white/20">
                  {weekDates.map((date, index) => {
                    const scheduleA = getSchedule(date, "SHIP_A");
                    const scheduleB = getSchedule(date, "SHIP_B");

                    return (
                      <div key={index} className="grid grid-cols-[180px_1fr_1fr]">
                        {/* Date Column */}
                        <div className="p-4 flex flex-col items-center justify-center">
                          <div className="bg-white rounded-lg p-2 w-full aspect-square flex flex-col items-center justify-center shadow-lg border-[3px] border-[#296341]">
                            <span className="text-[36px] font-black leading-none">{String(date.getDate()).padStart(2, '0')}</span>
                            <span className="text-[22px] font-bold">{weekdays[index]}</span>
                            <span className="text-[16px] font-medium">{months[date.getMonth()]}</span>
                          </div>
                        </div>

                        {/* Ship A */}
                        <div className="border-l border-white/20 flex min-h-[140px]">
                          {scheduleA ? (
                            <ScheduleItem data={scheduleA} onEdit={() => handleEditClick(date, "SHIP_A")} />
                          ) : (
                            <div
                              className="flex-1 flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/10 transition-colors"
                              onClick={() => handleEditClick(date, "SHIP_A")}
                            >
                              <Plus className="w-8 h-8 mr-2" />
                              <span>Add Schedule</span>
                            </div>
                          )}
                        </div>

                        {/* Ship B */}
                        <div className="border-l border-white/20 flex min-h-[140px]">
                          {scheduleB ? (
                            <ScheduleItem data={scheduleB} onEdit={() => handleEditClick(date, "SHIP_B")} />
                          ) : (
                            <div
                              className="flex-1 flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/10 transition-colors"
                              onClick={() => handleEditClick(date, "SHIP_B")}
                            >
                              <Plus className="w-8 h-8 mr-2" />
                              <span>Add Schedule</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-8">
              {/* Schedule for Later */}
              <div className="flex-1 min-w-[600px] flex items-center gap-4 bg-[#f8fafc] border border-gray-200 rounded-lg p-4 shadow-sm">
                <span className="text-[20px] font-bold text-[#296341] whitespace-nowrap flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Schedule to Launch
                </span>
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 rounded-md px-4 py-2 text-lg"
                  />
                  <input
                    type="time"
                    value={launchTime}
                    onChange={(e) => setLaunchTime(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 text-lg"
                  />
                </div>
                <button
                  onClick={handleScheduleLaunch}
                  disabled={isScheduling || !launchDate}
                  className="bg-[#296341] text-white px-6 py-2 rounded-md flex items-center gap-2 font-bold hover:bg-[#1a422b] transition-colors disabled:opacity-50"
                >
                  {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                  Schedule
                </button>
              </div>

              {/* Launch Now Button */}
              <button
                onClick={handleLaunchNow}
                disabled={isLaunching}
                className="bg-[#132540] text-white px-10 py-4 rounded-lg text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isLaunching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                Launch Now
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-6 text-gray-500 text-sm">
              <p><strong>Note:</strong> Click on any schedule cell to edit. "Launch Now" publishes all schedules immediately. "Schedule" sets a future publish date/time.</p>
            </div>
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSave={handleSaveSchedule}
          locations={locations}
        />
      )}

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[70px]" />
          </div>
          <div className="text-white text-[28px] font-semibold">
            {user?.role || "Dock Manager"} | <span className="font-normal">{user ? `${user.firstName} ${user.lastName}` : "Guest"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ScheduleManagement() {
  return <ScheduleManagementContent />;
}
