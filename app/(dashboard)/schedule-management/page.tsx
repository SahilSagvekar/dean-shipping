"use client"

import { useState, useEffect, useRef } from 'react';
import { MapPin, Check, ChevronDown, Plus, Trash2, Edit2, Loader2, X, Clock, Calendar, AlertCircle, ArrowRight, Train, Ship, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
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
  fromLocation: string;
  toLocation: string;
  departureTime: string;
  arrivalTime: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  type: string;
  notes: string;
  sortOrder?: number;
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

const eventTypes = [
  "Freight Drop Off",
  "Freight Pick Up",
  "Passenger Boarding",
  "Maintenance",
  "Special Service"
];

// ============================================================================
// EDITABLE SHIP NAME HEADER
// ============================================================================

function EditableShipName({
  name,
  onRename,
  className = "",
}: {
  name: string;
  onRename: (newName: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Display-friendly name
  const displayName = name.replace(/_/g, ' ');

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    } else {
      setEditValue(name);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 justify-center ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditValue(name);
              setIsEditing(false);
            }
          }}
          className="bg-white/20 border-2 border-white/60 text-white text-center text-2xl lg:text-[48px] font-bold tracking-[0.1em] px-4 py-1 rounded-lg outline-none focus:border-white w-full max-w-[300px] lg:max-w-[400px]"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setEditValue(name);
        setIsEditing(true);
      }}
      className={`group flex items-center gap-2 justify-center hover:bg-white/10 px-4 py-1 rounded-lg transition-all ${className}`}
      title="Click to rename ship"
    >
      <h2 className="text-2xl lg:text-[48px] font-bold text-white tracking-[0.2em]">{displayName}</h2>
      <Pencil className="w-4 h-4 lg:w-6 lg:h-6 text-white/40 group-hover:text-white/80 transition-colors" />
    </button>
  );
}

// ============================================================================
// SCHEDULE ITEM DISPLAY (reused in both desktop grid & mobile cards)
// ============================================================================

function ScheduleItem({ data, onEdit, compact = false }: { data: Schedule; onEdit: () => void; compact?: boolean }) {
  if (data.isHoliday) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 cursor-pointer hover:bg-white/10 transition-colors" onClick={onEdit}>
        <span className={`${compact ? 'text-xl' : 'text-[32px]'} font-extrabold text-white tracking-wider`}>Holiday</span>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col justify-center ${compact ? 'p-4 space-y-2' : 'p-6 space-y-4'} cursor-pointer hover:bg-white/10 transition-colors`} onClick={onEdit}>
      {data.events.length === 0 ? (
        <div className="text-white/60 text-center">
          <Plus className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} mx-auto mb-2`} />
          <span className={compact ? 'text-sm' : ''}>Click to add events</span>
        </div>
      ) : (
        data.events.map((event, idx) => {
          const fromLoc = event.fromLocation || event.location || "";
          const toLoc = event.toLocation || event.location || "";
          const depTime = event.departureTime || event.startTime || "";
          const arrTime = event.arrivalTime || event.endTime || "";
          const stopsCount = event.stops?.length || 0;

          return (
            <div key={idx} className="text-white">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} fill-white text-white`} />
                <span className={`${compact ? 'text-base' : 'text-[20px]'} font-bold`}>{fromLoc}</span>
                {toLoc && toLoc !== fromLoc && (
                  <>
                    <ArrowRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span className={`${compact ? 'text-base' : 'text-[20px]'} font-bold`}>{toLoc}</span>
                  </>
                )}
              </div>
              {(depTime || arrTime) && (
                <p className={`${compact ? 'text-xs pl-6' : 'text-sm pl-7'} opacity-80`}>
                  {depTime}{depTime && arrTime ? " — " : ""}{arrTime}
                </p>
              )}
              <div className={compact ? 'pl-6' : 'pl-7'}>
                <p className={`${compact ? 'text-sm' : 'text-[18px]'} font-bold leading-tight`}>{event.type}</p>
                {stopsCount > 0 && (
                  <p className={`${compact ? 'text-[11px]' : 'text-[14px]'} font-medium opacity-80 flex items-center gap-1`}>
                    <Train className="w-3.5 h-3.5" />
                    {stopsCount} stop{stopsCount > 1 ? 's' : ''}
                  </p>
                )}
                {event.notes && <p className={`${compact ? 'text-[11px]' : 'text-[14px]'} font-medium opacity-90`}>{event.notes}</p>}
              </div>
            </div>
          );
        })
      )}

      <div className="flex gap-2 mt-1">
        {data.isPublished && (
          <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded">Published</span>
        )}
        {data.launchAt && !data.isLaunched && (
          <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Scheduled
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EDIT MODAL (responsive — stacks on mobile)
// ============================================================================

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
    let result = type === "value" ? `${newValue} ${ampm || "AM"}` : `${val || ""} ${newValue}`;
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
    let result = type === "value" ? `${newValue} ${ampm || "AM"}` : `${val || ""} ${newValue}`;
    stops[stopIndex] = { ...stops[stopIndex], [field]: result.trim() };
    updated[eventIndex].stops = stops;
    setEvents(updated);
  };

  const toggleStopActivity = (eventIndex: number, stopIndex: number, activity: string) => {
    const updated = [...events];
    const stops = [...(updated[eventIndex].stops || [])];
    const cur = stops[stopIndex].activities || [];
    stops[stopIndex].activities = cur.includes(activity) ? cur.filter(a => a !== activity) : [...cur, activity];
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
      const mappedEvents = isHoliday ? [] : events.map(event => ({
        fromLocation: event.fromLocation || "",
        toLocation: event.toLocation || "",
        departureTime: event.departureTime || "",
        arrivalTime: event.arrivalTime || "",
        location: event.fromLocation || event.location || "",
        startTime: event.departureTime || event.startTime || "",
        endTime: event.arrivalTime || event.endTime || "",
        type: event.type,
        notes: event.notes || "",
        stops: (event.stops || []).map(stop => ({
          location: stop.location,
          arrivalTime: stop.arrivalTime || "",
          departureTime: stop.departureTime || "",
          activities: stop.activities || [],
          notes: stop.notes || "",
        })),
      }));
      await onSave({ isHoliday, events: mappedEvents as any });
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const shipDisplay = schedule.shipName.replace(/_/g, ' ');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#296341] p-4 sm:p-6 rounded-t-xl flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-white text-lg sm:text-2xl font-bold">{shipDisplay}</h3>
            <p className="text-white/80 text-sm">{schedule.weekday}, {schedule.date} {schedule.month}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Holiday Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isHoliday}
              onChange={(e) => setIsHoliday(e.target.checked)}
              className="w-5 h-5 accent-[#296341]"
            />
            <span className="text-lg font-medium">Mark as Holiday</span>
          </label>

          {/* Events Editor */}
          {!isHoliday && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">Journeys</h4>
                <button onClick={addEvent} className="bg-[#296341] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1e4a2e] text-sm">
                  <Plus className="w-4 h-4" /> Add Journey
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No journeys. Click "Add Journey" to create one.
                </div>
              ) : (
                <div className="space-y-6">
                  {events.map((event, ei) => (
                    <div key={ei} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#296341] text-white text-sm px-2 py-1 rounded font-medium">Journey {ei + 1}</span>
                          {event.stops?.length > 0 && (
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                              <Train className="w-4 h-4" /> {event.stops.length} stop{event.stops.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <button onClick={() => removeEvent(ei)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* From / To — stacks on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-end">
                          <div>
                            <label className="block text-sm font-medium mb-1">From</label>
                            <select value={event.fromLocation} onChange={(e) => updateEvent(ei, "fromLocation", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                              {locations.map(loc => <option key={loc.code} value={loc.code}>{loc.name} ({loc.code})</option>)}
                            </select>
                          </div>
                          <div className="hidden sm:flex items-center justify-center pb-2">
                            <ArrowRight className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">To</label>
                            <select value={event.toLocation} onChange={(e) => updateEvent(ei, "toLocation", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                              {locations.map(loc => <option key={loc.code} value={loc.code}>{loc.name} ({loc.code})</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Time — stacks on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Departure Time</label>
                            <div className="flex gap-2">
                              <input type="text" value={getTimeParts(event.departureTime).value} onChange={(e) => updateTime(ei, "departureTime", "value", e.target.value)} placeholder="8:00" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                              <select value={getTimeParts(event.departureTime).ampm} onChange={(e) => updateTime(ei, "departureTime", "ampm", e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-50">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Arrival Time</label>
                            <div className="flex gap-2">
                              <input type="text" value={getTimeParts(event.arrivalTime).value} onChange={(e) => updateTime(ei, "arrivalTime", "value", e.target.value)} placeholder="2:00" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                              <select value={getTimeParts(event.arrivalTime).ampm} onChange={(e) => updateTime(ei, "arrivalTime", "ampm", e.target.value)} className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-50">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Type & Notes — stacks on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select value={event.type} onChange={(e) => updateEvent(ei, "type", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                              {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <input type="text" value={event.notes} onChange={(e) => updateEvent(ei, "notes", e.target.value)} placeholder="e.g., Dry Freight Only" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                          </div>
                        </div>

                        {/* Intermediate Stops */}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-700 flex items-center gap-2">
                              <Train className="w-4 h-4" /> Intermediate Stops
                            </h5>
                            <button onClick={() => addStop(ei)} className="text-[#296341] text-sm font-medium flex items-center gap-1 hover:underline">
                              <Plus className="w-4 h-4" /> Add Stop
                            </button>
                          </div>

                          {(!event.stops || event.stops.length === 0) ? (
                            <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                              No intermediate stops. Direct journey.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {event.stops.map((stop, si) => (
                                <div key={si} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-700">Stop {si + 1}</span>
                                    <button onClick={() => removeStop(ei, si)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {/* Stop fields — stacks on mobile */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">Location</label>
                                      <select value={stop.location} onChange={(e) => updateStop(ei, si, "location", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                                        {locations.map(loc => <option key={loc.code} value={loc.code}>{loc.name}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">Arrival</label>
                                      <div className="flex gap-1">
                                        <input type="text" value={getTimeParts(stop.arrivalTime).value} onChange={(e) => updateStopTime(ei, si, "arrivalTime", "value", e.target.value)} placeholder="10:00" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                                        <select value={getTimeParts(stop.arrivalTime).ampm} onChange={(e) => updateStopTime(ei, si, "arrivalTime", "ampm", e.target.value)} className="border border-gray-300 rounded px-1 py-1.5 text-sm bg-gray-50">
                                          <option value="AM">AM</option>
                                          <option value="PM">PM</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1 text-gray-600">Departure</label>
                                      <div className="flex gap-1">
                                        <input type="text" value={getTimeParts(stop.departureTime).value} onChange={(e) => updateStopTime(ei, si, "departureTime", "value", e.target.value)} placeholder="10:30" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                                        <select value={getTimeParts(stop.departureTime).ampm} onChange={(e) => updateStopTime(ei, si, "departureTime", "ampm", e.target.value)} className="border border-gray-300 rounded px-1 py-1.5 text-sm bg-gray-50">
                                          <option value="AM">AM</option>
                                          <option value="PM">PM</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Activities</label>
                                    <div className="flex flex-wrap gap-2">
                                      {eventTypes.map(activity => (
                                        <label key={activity} className="flex items-center gap-1 text-xs cursor-pointer">
                                          <input type="checkbox" checked={stop.activities?.includes(activity) || false} onChange={() => toggleStopActivity(ei, si, activity)} className="w-3 h-3 accent-[#296341]" />
                                          <span>{activity}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <input type="text" value={stop.notes} onChange={(e) => updateStop(ei, si, "notes", e.target.value)} placeholder="Stop notes (optional)" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
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
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="bg-[#132540] text-white px-6 py-2 rounded-lg hover:bg-[#1a3254] disabled:opacity-50 flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MOBILE DAY CARD
// ============================================================================

function MobileDayCard({
  date,
  weekday,
  month,
  scheduleA,
  scheduleB,
  activeShip,
  onEdit,
}: {
  date: Date;
  weekday: string;
  month: string;
  scheduleA: Schedule | null;
  scheduleB: Schedule | null;
  activeShip: string;
  onEdit: (date: Date, shipName: string) => void;
}) {
  const schedule = activeShip === "SHIP_A" ? scheduleA : scheduleB;
  const hasEvents = schedule && (schedule.events.length > 0 || schedule.isHoliday);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md border border-white/10 active:scale-[0.98] transition-transform"
      onClick={() => onEdit(date, activeShip === "SHIP_A" ? shipNameA : shipNameB)}
    >
      {/* Day header */}
      <div className="bg-[#296341] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg w-12 h-12 flex flex-col items-center justify-center">
            <span className="text-lg font-black leading-none">{String(date.getDate()).padStart(2, '0')}</span>
            <span className="text-[10px] font-bold text-gray-500">{weekday}</span>
          </div>
          <div className="text-white">
            <p className="text-sm font-bold">{month}</p>
            {schedule?.isPublished && (
              <span className="text-[10px] bg-green-400/30 px-2 py-0.5 rounded-full">Published</span>
            )}
          </div>
        </div>
        <Edit2 className="w-5 h-5 text-white/50" />
      </div>

      {/* Content */}
      <div className="relative min-h-[80px]">
        <div className="absolute inset-0 z-0">
          <img src={imgShipBg.src} alt="" className="w-full h-full object-cover brightness-[0.3]" />
        </div>
        <div className="relative z-10">
          {schedule ? (
            <ScheduleItem data={schedule} onEdit={() => {}} compact />
          ) : (
            <div className="flex items-center justify-center py-6 text-white/40">
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-sm">Tap to add</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// We need shipNameA and shipNameB accessible in MobileDayCard, so we'll pass them as props instead.
// Let me restructure — MobileDayCard will receive the actual shipName.

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ScheduleManagementContent() {
  const { user, apiFetch, isLoading: authLoading, isAuthenticated } = useAuth();

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

  // Ship names — editable, persisted in localStorage
  const [shipNameA, setShipNameA] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dsl_ship_a') || 'SHIP_A';
    return 'SHIP_A';
  });
  const [shipNameB, setShipNameB] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dsl_ship_b') || 'SHIP_B';
    return 'SHIP_B';
  });

  // Mobile: active ship tab
  const [mobileActiveShip, setMobileActiveShip] = useState<'A' | 'B'>('A');

  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("00:00");
  const [isLaunching, setIsLaunching] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Ship rename handlers
  const handleRenameShipA = (newName: string) => {
    // Update all existing schedules with old name to new name
    setSchedules(prev => prev.map(s => s.shipName === shipNameA ? { ...s, shipName: newName } : s));
    setShipNameA(newName);
    if (typeof window !== 'undefined') localStorage.setItem('dsl_ship_a', newName);
  };

  const handleRenameShipB = (newName: string) => {
    setSchedules(prev => prev.map(s => s.shipName === shipNameB ? { ...s, shipName: newName } : s));
    setShipNameB(newName);
    if (typeof window !== 'undefined') localStorage.setItem('dsl_ship_b', newName);
  };

  // Fetch locations
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    async function fetchLocations() {
      try {
        const res = await apiFetch("/api/locations");
        if (!res.ok) return;
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

  // Fetch schedules
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
          setError(`Failed to fetch schedules (${res.status})`);
          return;
        }
        const data = await res.json();
        setSchedules(data.schedules || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch schedules");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedules();
  }, [currentWeekStart, apiFetch, authLoading, isAuthenticated]);

  const getSchedule = (date: Date, shipName: string): Schedule | null => {
    const dateStr = toLocalISO(date);
    return schedules.find(s => {
      const sDateStr = toLocalISO(new Date(s.date));
      return sDateStr === dateStr && s.shipName === shipName;
    }) || null;
  };

  const handleEditClick = async (date: Date, shipName: string) => {
    let schedule = getSchedule(date, shipName);
    if (!schedule) {
      const dateStr = toLocalISO(date);
      const weekday = weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const month = months[date.getMonth()];
      try {
        const res = await apiFetch("/api/schedules", {
          method: "POST",
          body: JSON.stringify({ date: dateStr, weekday, month, shipName, isHoliday: false, events: [] }),
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
    setSchedules(schedules.map(s => s.id === editingSchedule.id ? data.schedule : s));
  };

  const handleLaunchNow = async () => {
    if (!confirm("Publish all schedules for this week and create voyages?")) return;
    setIsLaunching(true);
    try {
      const scheduleIds: string[] = [];
      for (const schedule of schedules) {
        const res = await apiFetch(`/api/schedules/${schedule.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublished: true, isLaunched: true }),
        });
        if (res.ok) scheduleIds.push(schedule.id);
      }
      try {
        const voyageRes = await apiFetch("/api/schedules/create-voyages", {
          method: "POST",
          body: JSON.stringify({ scheduleIds }),
        });
        if (voyageRes.ok) {
          const voyageData = await voyageRes.json();
          alert(voyageData.voyages?.length > 0
            ? `Published! ${voyageData.voyages.length} voyage(s) created.`
            : "Published! No new voyages created.");
        }
      } catch (voyageErr) {
        alert("Published! Voyage creation had an error.");
      }
      const startDate = toLocalISO(weekDates[0]);
      const endDate = toLocalISO(weekDates[5]);
      const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      alert("Failed to publish schedules");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleScheduleLaunch = async () => {
    if (!launchDate || !launchTime) { alert("Select date and time"); return; }
    const launchAt = new Date(`${launchDate}T${launchTime}`);
    if (launchAt <= new Date()) { alert("Select a future date/time"); return; }
    if (!confirm(`Schedule launch for ${launchAt.toLocaleString()}?`)) return;
    setIsScheduling(true);
    try {
      for (const schedule of schedules) {
        await apiFetch(`/api/schedules/${schedule.id}`, {
          method: "PATCH",
          body: JSON.stringify({ launchAt: launchAt.toISOString() }),
        });
      }
      const startDate = toLocalISO(weekDates[0]);
      const endDate = toLocalISO(weekDates[5]);
      const res = await apiFetch(`/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=100`);
      if (res.ok) setSchedules((await res.json()).schedules || []);
      alert(`Scheduled for ${launchAt.toLocaleString()}`);
    } catch (err) {
      alert("Failed to schedule launch");
    } finally {
      setIsScheduling(false);
    }
  };

  const prevWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d); };
  const nextWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d); };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#296341]" /></div>;
  }
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

  const weekRangeStr = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekDates[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero — hidden on mobile */}
      <div className="hidden lg:flex justify-center mb-12 px-8">
        <img src={imgHero.src} alt="Schedule Planning" className="w-full max-w-[900px] h-auto" />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12 flex-1 w-full">
        {/* Title */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-[36px] font-bold text-black mb-1">SCHEDULE MANAGEMENT</h1>
          <div className="h-[3px] lg:h-[4px] bg-black w-[120px] lg:w-[180px]" />
        </div>

        {/* ════════════════════════════════════════════════════
            WEEK NAVIGATION
            ════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <button onClick={prevWeek} className="p-2 lg:px-6 lg:py-2 border border-[#296341] text-[#296341] rounded-lg hover:bg-[#296341] hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 lg:hidden" />
            <span className="hidden lg:inline">← Previous Week</span>
          </button>
          <h2 className="text-sm lg:text-2xl font-bold text-center">{weekRangeStr}</h2>
          <button onClick={nextWeek} className="p-2 lg:px-6 lg:py-2 border border-[#296341] text-[#296341] rounded-lg hover:bg-[#296341] hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5 lg:hidden" />
            <span className="hidden lg:inline">Next Week →</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#296341]" />
          </div>
        ) : (
          <>
            {/* ════════════════════════════════════════════════════
                MOBILE VIEW (below lg)
                ════════════════════════════════════════════════════ */}
            <div className="lg:hidden space-y-4">
              {/* Ship Tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setMobileActiveShip('A')}
                  className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    mobileActiveShip === 'A'
                      ? 'bg-[#296341] text-white shadow-lg'
                      : 'text-gray-500'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                  {shipNameA.replace(/_/g, ' ')}
                </button>
                <button
                  onClick={() => setMobileActiveShip('B')}
                  className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    mobileActiveShip === 'B'
                      ? 'bg-[#296341] text-white shadow-lg'
                      : 'text-gray-500'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                  {shipNameB.replace(/_/g, ' ')}
                </button>
              </div>

              {/* Rename button */}
              <button
                onClick={() => {
                  const current = mobileActiveShip === 'A' ? shipNameA : shipNameB;
                  const newName = prompt('Rename ship:', current.replace(/_/g, ' '));
                  if (newName?.trim()) {
                    if (mobileActiveShip === 'A') handleRenameShipA(newName.trim());
                    else handleRenameShipB(newName.trim());
                  }
                }}
                className="flex items-center gap-2 text-[#296341] text-xs font-bold ml-1"
              >
                <Pencil className="w-3 h-3" /> Rename Ship
              </button>

              {/* Day Cards */}
              <div className="space-y-3">
                {weekDates.map((date, index) => {
                  const activeShipName = mobileActiveShip === 'A' ? shipNameA : shipNameB;
                  const schedule = getSchedule(date, activeShipName);
                  const hasEvents = schedule && (schedule.events.length > 0 || schedule.isHoliday);

                  return (
                    <div
                      key={index}
                      className="rounded-2xl overflow-hidden shadow-md active:scale-[0.98] transition-transform"
                      onClick={() => handleEditClick(date, activeShipName)}
                    >
                      <div className="bg-[#296341] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-lg w-12 h-12 flex flex-col items-center justify-center shadow">
                            <span className="text-lg font-black leading-none">{String(date.getDate()).padStart(2, '0')}</span>
                            <span className="text-[10px] font-bold text-gray-500">{weekdays[index]}</span>
                          </div>
                          <div className="text-white">
                            <p className="text-sm font-bold">{months[date.getMonth()]}</p>
                            <div className="flex gap-1.5">
                              {schedule?.isPublished && <span className="text-[9px] bg-green-400/30 px-1.5 py-0.5 rounded-full">Published</span>}
                              {schedule?.launchAt && !schedule?.isLaunched && <span className="text-[9px] bg-yellow-400/30 px-1.5 py-0.5 rounded-full">Scheduled</span>}
                            </div>
                          </div>
                        </div>
                        <Edit2 className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="relative min-h-[70px]">
                        <div className="absolute inset-0 z-0">
                          <img src={imgShipBg.src} alt="" className="w-full h-full object-cover brightness-[0.3]" />
                        </div>
                        <div className="relative z-10">
                          {schedule ? (
                            <ScheduleItem data={schedule} onEdit={() => {}} compact />
                          ) : (
                            <div className="flex items-center justify-center py-6 text-white/40">
                              <Plus className="w-5 h-5 mr-2" />
                              <span className="text-sm">Tap to add schedule</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Controls */}
              <div className="space-y-3 pt-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-bold text-[#296341] flex items-center gap-2"><Clock className="w-4 h-4" /> Schedule to Launch</p>
                  <input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                  <input type="time" value={launchTime} onChange={(e) => setLaunchTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
                  <button onClick={handleScheduleLaunch} disabled={isScheduling || !launchDate} className="w-full bg-[#296341] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95">
                    {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />} Schedule
                  </button>
                </div>
                <button onClick={handleLaunchNow} disabled={isLaunching} className="w-full bg-[#132540] text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg">
                  {isLaunching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />} Launch Now
                </button>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════
                DESKTOP VIEW (lg and above) — original grid layout
                ════════════════════════════════════════════════════ */}
            <div className="hidden lg:block">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 z-0">
                  <img src={imgShipBg.src} alt="" className="w-full h-full object-cover brightness-[0.4]" />
                </div>
                <div className="relative z-10">
                  {/* Table Header with Editable Ship Names */}
                  <div className="grid grid-cols-[180px_1fr_1fr] bg-black/20 backdrop-blur-sm border-b border-white/20">
                    <div className="py-4 text-center">
                      <span className="text-white text-lg font-medium">Click to edit</span>
                    </div>
                    <div className="py-6 flex items-center justify-center">
                      <EditableShipName name={shipNameA} onRename={handleRenameShipA} />
                    </div>
                    <div className="py-6 flex items-center justify-center border-l border-white/20">
                      <EditableShipName name={shipNameB} onRename={handleRenameShipB} />
                    </div>
                  </div>

                  {/* Schedule Rows */}
                  <div className="divide-y divide-white/20">
                    {weekDates.map((date, index) => {
                      const scheduleA = getSchedule(date, shipNameA);
                      const scheduleB = getSchedule(date, shipNameB);

                      return (
                        <div key={index} className="grid grid-cols-[180px_1fr_1fr]">
                          <div className="p-4 flex flex-col items-center justify-center">
                            <div className="bg-white rounded-lg p-2 w-full aspect-square flex flex-col items-center justify-center shadow-lg border-[3px] border-[#296341]">
                              <span className="text-[36px] font-black leading-none">{String(date.getDate()).padStart(2, '0')}</span>
                              <span className="text-[22px] font-bold">{weekdays[index]}</span>
                              <span className="text-[16px] font-medium">{months[date.getMonth()]}</span>
                            </div>
                          </div>
                          <div className="border-l border-white/20 flex min-h-[140px]">
                            {scheduleA ? (
                              <ScheduleItem data={scheduleA} onEdit={() => handleEditClick(date, shipNameA)} />
                            ) : (
                              <div className="flex-1 flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleEditClick(date, shipNameA)}>
                                <Plus className="w-8 h-8 mr-2" /><span>Add Schedule</span>
                              </div>
                            )}
                          </div>
                          <div className="border-l border-white/20 flex min-h-[140px]">
                            {scheduleB ? (
                              <ScheduleItem data={scheduleB} onEdit={() => handleEditClick(date, shipNameB)} />
                            ) : (
                              <div className="flex-1 flex items-center justify-center text-white/50 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleEditClick(date, shipNameB)}>
                                <Plus className="w-8 h-8 mr-2" /><span>Add Schedule</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Desktop Controls */}
              <div className="mt-12 flex flex-wrap items-center justify-between gap-8">
                <div className="flex-1 min-w-[600px] flex items-center gap-4 bg-[#f8fafc] border border-gray-200 rounded-lg p-4 shadow-sm">
                  <span className="text-[20px] font-bold text-[#296341] whitespace-nowrap flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Schedule to Launch
                  </span>
                  <div className="flex items-center gap-4 flex-1">
                    <input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="border border-gray-300 rounded-md px-4 py-2 text-lg" />
                    <input type="time" value={launchTime} onChange={(e) => setLaunchTime(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-lg" />
                  </div>
                  <button onClick={handleScheduleLaunch} disabled={isScheduling || !launchDate} className="bg-[#296341] text-white px-6 py-2 rounded-md flex items-center gap-2 font-bold hover:bg-[#1a422b] transition-colors disabled:opacity-50">
                    {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />} Schedule
                  </button>
                </div>
                <button onClick={handleLaunchNow} disabled={isLaunching} className="bg-[#132540] text-white px-10 py-4 rounded-lg text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isLaunching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />} Launch Now
                </button>
              </div>

              <div className="mt-6 text-gray-500 text-sm">
                <p><strong>Note:</strong> Click on any schedule cell to edit. Click ship name headers to rename. "Launch Now" publishes all schedules immediately.</p>
              </div>
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

      {/* Footer — hidden on mobile */}
      <footer className="hidden lg:block bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[70px]" />
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