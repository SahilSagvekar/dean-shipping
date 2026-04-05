"use client"

import { useState, useEffect } from 'react';
import { MapPin, Check, ChevronDown, Plus, Trash2, Edit2, Loader2, X, Clock, Calendar, AlertCircle, ArrowRight, Train } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgHero from "@/app/assets/b493fe526d34a8d0e654480300ff88ab45d2dde1.png";
import imgShipBg from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";
import { useAuth } from "@/lib/auth-context";

// Types
interface ScheduleEventStop {
  id?: string;
  location: string;
  arrivalTime: string;
  departureTime: string;
  activities: string[];
  notes: string;
  stopOrder?: number;
}

interface ScheduleEvent {
  id?: string;
  // New structure
  fromLocation: string;
  toLocation: string;
  departureTime: string;
  arrivalTime: string;
  // Legacy fields (for backward compatibility)
  location?: string;
  startTime?: string;
  endTime?: string;
  // Common fields
  type: string;
  notes: string;
  sortOrder?: number;
  // Intermediate stops
  stops: ScheduleEventStop[];
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
        data.events.map((event, idx) => {
          // Support both new and legacy format
          const fromLoc = event.fromLocation || event.location || "";
          const toLoc = event.toLocation || event.location || "";
          const depTime = event.departureTime || event.startTime || "";
          const arrTime = event.arrivalTime || event.endTime || "";
          const stopsCount = event.stops?.length || 0;
          
          return (
            <div key={idx} className="text-white">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <MapPin className="w-5 h-5 fill-white text-white" />
                <span className="text-[20px] font-bold">{fromLoc}</span>
                {toLoc && toLoc !== fromLoc && (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-[20px] font-bold">{toLoc}</span>
                  </>
                )}
                {(depTime || arrTime) && (
                  <span className="text-[18px] font-medium ml-2 opacity-90">
                    ({depTime}{depTime && arrTime ? " - " : ""}{arrTime})
                  </span>
                )}
              </div>
              <div className="pl-7">
                <p className="text-[18px] font-bold leading-tight">{event.type}</p>
                {stopsCount > 0 && (
                  <p className="text-[14px] font-medium opacity-80 flex items-center gap-1">
                    <Train className="w-4 h-4" />
                    {stopsCount} intermediate stop{stopsCount > 1 ? 's' : ''}
                  </p>
                )}
                {event.notes && <p className="text-[14px] font-medium opacity-90">{event.notes}</p>}
              </div>
            </div>
          );
        })
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
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    // Convert legacy events to new format if needed
    return (schedule.events || []).map(event => ({
      ...event,
      fromLocation: event.fromLocation || event.location || locations[0]?.code || "",
      toLocation: event.toLocation || event.location || locations[0]?.code || "",
      departureTime: event.departureTime || event.startTime || "",
      arrivalTime: event.arrivalTime || event.endTime || "",
      stops: event.stops || [],
    }));
  });
  const [isSaving, setIsSaving] = useState(false);

  const addEvent = () => {
    setEvents([...events, {
      fromLocation: locations[0]?.code || "",
      toLocation: locations[1]?.code || locations[0]?.code || "",
      departureTime: "",
      arrivalTime: "",
      type: eventTypes[0],
      notes: "",
      stops: [],
    }]);
  };

  const updateEvent = (index: number, field: keyof ScheduleEvent, value: any) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    setEvents(updated);
  };

  const updateTime = (index: number, field: "departureTime" | "arrivalTime", type: "value" | "ampm", newValue: string) => {
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

  // Stop management functions
  const addStop = (eventIndex: number) => {
    const updated = [...events];
    const currentStops = updated[eventIndex].stops || [];
    updated[eventIndex].stops = [...currentStops, {
      location: locations[0]?.code || "",
      arrivalTime: "",
      departureTime: "",
      activities: [],
      notes: "",
    }];
    setEvents(updated);
  };

  const updateStop = (eventIndex: number, stopIndex: number, field: keyof ScheduleEventStop, value: any) => {
    const updated = [...events];
    const stops = [...(updated[eventIndex].stops || [])];
    stops[stopIndex] = { ...stops[stopIndex], [field]: value };
    updated[eventIndex].stops = stops;
    setEvents(updated);
  };

  const updateStopTime = (eventIndex: number, stopIndex: number, field: "arrivalTime" | "departureTime", type: "value" | "ampm", newValue: string) => {
    const updated = [...events];
    const stops = [...(updated[eventIndex].stops || [])];
    const current = stops[stopIndex][field] || "";
    const [val, ampm] = current.split(" ");

    let result = "";
    if (type === "value") {
      result = `${newValue} ${ampm || "AM"}`;
    } else {
      result = `${val || ""} ${newValue}`;
    }

    stops[stopIndex] = { ...stops[stopIndex], [field]: result.trim() };
    updated[eventIndex].stops = stops;
    setEvents(updated);
  };

  const toggleStopActivity = (eventIndex: number, stopIndex: number, activity: string) => {
    const updated = [...events];
    const stops = [...(updated[eventIndex].stops || [])];
    const currentActivities = stops[stopIndex].activities || [];
    
    if (currentActivities.includes(activity)) {
      stops[stopIndex].activities = currentActivities.filter(a => a !== activity);
    } else {
      stops[stopIndex].activities = [...currentActivities, activity];
    }
    
    updated[eventIndex].stops = stops;
    setEvents(updated);
  };

  const removeStop = (eventIndex: number, stopIndex: number) => {
    const updated = [...events];
    updated[eventIndex].stops = (updated[eventIndex].stops || []).filter((_, i) => i !== stopIndex);
    setEvents(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map events with full new format (fromLocation, toLocation, stops)
      // Also include legacy fields for backward compatibility
      const mappedEvents = isHoliday ? [] : events.map(event => ({
        // New format fields
        fromLocation: event.fromLocation || "",
        toLocation: event.toLocation || "",
        departureTime: event.departureTime || "",
        arrivalTime: event.arrivalTime || "",
        // Legacy fields (for backward compatibility with existing code)
        location: event.fromLocation || event.location || "",
        startTime: event.departureTime || event.startTime || "",
        endTime: event.arrivalTime || event.endTime || "",
        // Common fields
        type: event.type,
        notes: event.notes || "",
        // Intermediate stops
        stops: (event.stops || []).map(stop => ({
          location: stop.location,
          arrivalTime: stop.arrivalTime || "",
          departureTime: stop.departureTime || "",
          activities: stop.activities || [],
          notes: stop.notes || "",
        })),
      }));

      await onSave({
        isHoliday,
        events: mappedEvents as any,
      });
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#296341] p-6 rounded-t-xl flex items-center justify-between sticky top-0 z-10">
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
                <h4 className="text-lg font-bold">Journeys</h4>
                <button
                  onClick={addEvent}
                  className="bg-[#296341] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1e4a2e]"
                >
                  <Plus className="w-4 h-4" /> Add Journey
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No journeys. Click "Add Journey" to create one.
                </div>
              ) : (
                <div className="space-y-6">
                  {events.map((event, eventIndex) => (
                    <div key={eventIndex} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      {/* Event Header */}
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#296341] text-white text-sm px-2 py-1 rounded font-medium">
                            Journey {eventIndex + 1}
                          </span>
                          {event.stops?.length > 0 && (
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                              <Train className="w-4 h-4" />
                              {event.stops.length} stop{event.stops.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeEvent(eventIndex)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* From / To Row */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
                          <div>
                            <label className="block text-sm font-medium mb-1">From</label>
                            <select
                              value={event.fromLocation}
                              onChange={(e) => updateEvent(eventIndex, "fromLocation", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              {locations.map(loc => (
                                <option key={loc.code} value={loc.code}>{loc.name} ({loc.code})</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center justify-center pb-2">
                            <ArrowRight className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <select
                              value={event.toLocation}
                              onChange={(e) => updateEvent(eventIndex, "toLocation", e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              {locations.map(loc => (
                                <option key={loc.code} value={loc.code}>{loc.name} ({loc.code})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Departure Time</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getTimeParts(event.departureTime).value}
                                onChange={(e) => updateTime(eventIndex, "departureTime", "value", e.target.value)}
                                placeholder="e.g., 8:00"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                              <select
                                value={getTimeParts(event.departureTime).ampm}
                                onChange={(e) => updateTime(eventIndex, "departureTime", "ampm", e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-50"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Arrival Time</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={getTimeParts(event.arrivalTime).value}
                                onChange={(e) => updateTime(eventIndex, "arrivalTime", "value", e.target.value)}
                                placeholder="e.g., 2:00"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                              <select
                                value={getTimeParts(event.arrivalTime).ampm}
                                onChange={(e) => updateTime(eventIndex, "arrivalTime", "ampm", e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-50"
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Type and Notes Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                              value={event.type}
                              onChange={(e) => updateEvent(eventIndex, "type", e.target.value)}
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
                              onChange={(e) => updateEvent(eventIndex, "notes", e.target.value)}
                              placeholder="e.g., Dry Freight Only"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                          </div>
                        </div>

                        {/* Intermediate Stops Section */}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-700 flex items-center gap-2">
                              <Train className="w-4 h-4" />
                              Intermediate Stops
                            </h5>
                            <button
                              onClick={() => addStop(eventIndex)}
                              className="text-[#296341] text-sm font-medium flex items-center gap-1 hover:underline"
                            >
                              <Plus className="w-4 h-4" /> Add Stop
                            </button>
                          </div>

                          {(!event.stops || event.stops.length === 0) ? (
                            <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                              No intermediate stops. Direct journey from {event.fromLocation} to {event.toLocation}.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {event.stops.map((stop, stopIndex) => (
                                <div key={stopIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-700">Stop {stopIndex + 1}</span>
                                    <button
                                      onClick={() => removeStop(eventIndex, stopIndex)}
                                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-3">
                                    {/* Location */}
                                    <div>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">Location</label>
                                      <select
                                        value={stop.location}
                                        onChange={(e) => updateStop(eventIndex, stopIndex, "location", e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                      >
                                        {locations.map(loc => (
                                          <option key={loc.code} value={loc.code}>{loc.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    {/* Arrival */}
                                    <div>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">Arrival</label>
                                      <div className="flex gap-1">
                                        <input
                                          type="text"
                                          value={getTimeParts(stop.arrivalTime).value}
                                          onChange={(e) => updateStopTime(eventIndex, stopIndex, "arrivalTime", "value", e.target.value)}
                                          placeholder="10:00"
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                        <select
                                          value={getTimeParts(stop.arrivalTime).ampm}
                                          onChange={(e) => updateStopTime(eventIndex, stopIndex, "arrivalTime", "ampm", e.target.value)}
                                          className="border border-gray-300 rounded px-1 py-1.5 text-sm bg-gray-50"
                                        >
                                          <option value="AM">AM</option>
                                          <option value="PM">PM</option>
                                        </select>
                                      </div>
                                    </div>
                                    
                                    {/* Departure */}
                                    <div>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">Departure</label>
                                      <div className="flex gap-1">
                                        <input
                                          type="text"
                                          value={getTimeParts(stop.departureTime).value}
                                          onChange={(e) => updateStopTime(eventIndex, stopIndex, "departureTime", "value", e.target.value)}
                                          placeholder="10:30"
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                        <select
                                          value={getTimeParts(stop.departureTime).ampm}
                                          onChange={(e) => updateStopTime(eventIndex, stopIndex, "departureTime", "ampm", e.target.value)}
                                          className="border border-gray-300 rounded px-1 py-1.5 text-sm bg-gray-50"
                                        >
                                          <option value="AM">AM</option>
                                          <option value="PM">PM</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Activities */}
                                  <div className="mt-2">
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Activities</label>
                                    <div className="flex flex-wrap gap-2">
                                      {eventTypes.map(activity => (
                                        <label key={activity} className="flex items-center gap-1 text-xs cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={stop.activities?.includes(activity) || false}
                                            onChange={() => toggleStopActivity(eventIndex, stopIndex, activity)}
                                            className="w-3 h-3 accent-[#296341]"
                                          />
                                          <span>{activity}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Notes */}
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      value={stop.notes}
                                      onChange={(e) => updateStop(eventIndex, stopIndex, "notes", e.target.value)}
                                      placeholder="Stop notes (optional)"
                                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
  const { user, apiFetch, isLoading: authLoading, isAuthenticated } = useAuth();

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

  // Fetch locations - wait for auth to be ready
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function fetchLocations() {
      try {
        const res = await apiFetch("/api/locations");
        if (!res.ok) {
          console.error("Failed to fetch locations:", res.status);
          return;
        }
        const data = await res.json();
        if (data.locations) {
          setLocations(data.locations.map((l: any) => ({ code: l.code, name: l.name })));
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    }
    fetchLocations();
  }, [apiFetch, authLoading, isAuthenticated]);

  // Fetch schedules for current week - wait for auth to be ready
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function fetchSchedules() {
      setIsLoading(true);
      setError("");
      try {
        const startDate = toLocalISO(weekDates[0]);
        const endDate = toLocalISO(weekDates[5]);

        const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Schedule fetch failed:", res.status, errorText);
          setError(`Failed to fetch schedules (${res.status})`);
          return;
        }

        const data = await res.json();
        setSchedules(data.schedules || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch schedules");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedules();
  }, [currentWeekStart, apiFetch, authLoading, isAuthenticated]);

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

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          alert(errorData.error || `Failed to create schedule (${res.status})`);
          return;
        }

        const data = await res.json();
        schedule = data.schedule;
        setSchedules([...schedules, data.schedule]);
      } catch (err) {
        console.error("Create schedule error:", err);
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

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save");
    }

    const data = await res.json();

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
        const res = await apiFetch(`/api/schedules/${schedule.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublished: true, isLaunched: true }),
        });
        if (res.ok) {
          scheduleIds.push(schedule.id);
        }
      }

      // Step 2: Auto-create voyages from the published schedules
      try {
        const voyageRes = await apiFetch("/api/schedules/create-voyages", {
          method: "POST",
          body: JSON.stringify({ scheduleIds }),
        });
        
        if (voyageRes.ok) {
          const voyageData = await voyageRes.json();
          if (voyageData.voyages?.length > 0) {
            alert(
              `Schedules published successfully!\n\n` +
              `${voyageData.voyages.length} voyage(s) created:\n` +
              voyageData.voyages
                .map((v: any) => `• Voyage #${v.voyageNo} — ${v.shipName} (${v.stops?.length || 0} stops)`)
                .join("\n")
            );
          } else {
            alert("Schedules published successfully!\n\nNo new voyages were created (may already exist or schedules have no events).");
          }
        } else {
          const errorData = await voyageRes.json().catch(() => ({}));
          alert(`Schedules published, but voyage creation had an issue: ${errorData.error || "Unknown error"}`);
        }
      } catch (voyageErr) {
        console.error("Voyage creation error:", voyageErr);
        alert("Schedules published successfully!\n\nNote: Automatic voyage creation encountered an error. You can create voyages manually.");
      }

      // Refresh schedules
      const startDate = toLocalISO(weekDates[0]);
      const endDate = toLocalISO(weekDates[5]);
      const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Launch error:", err);
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
      const startDate = toLocalISO(weekDates[0]);
      const endDate = toLocalISO(weekDates[5]);
      const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }

      alert(`Schedules will be published on ${launchAt.toLocaleString()}`);
    } catch (err) {
      console.error("Schedule launch error:", err);
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

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access schedule management.</p>
        </div>
      </div>
    );
  }

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