"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, ChevronLeft, ChevronRight, Truck, Package, Users, Car, Bike, Bus, Boxes, Container, Layers, Wheat, Anchor, Ship, ArrowRight, Train, Clock } from "lucide-react";
import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "@/app/assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgRectangle490 from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";

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
  stops?: ScheduleEventStop[];
}

interface Schedule {
  id: string;
  date: string;
  weekday: string;
  month: string;
  shipName: string;
  isHoliday: boolean;
  isPublished: boolean;
  launchAt?: string | null;
  isLaunched?: boolean;
  events: ScheduleEvent[];
}

// Hero Section
function Hero() {
  return (
    <section className="relative mt-20 md:mt-[135px] h-[600px] md:h-[842px] overflow-hidden">
      <img alt="" className="absolute inset-0 w-full h-full object-cover" src={imgRectangle4.src} />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-12 h-full flex flex-col justify-between py-12 md:py-24 text-white">
        {/* Main Title */}
        <div className="mt-8 md:mt-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl lg:text-[75px] font-bold leading-tight drop-shadow-2xl italic">
            "Fast Tracked,<br className="hidden md:block" />
            <span className="md:ml-12">Securely Delivered."</span>
          </h1>
        </div>

        {/* Service Groups */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8 lg:gap-10 w-full px-4 mb-8 md:mb-0">
          {[
            {
              label: "Vehicle",
              icons: [Car, Truck, Bike, Bus],
              maxWidth: "max-w-[280px]"
            },
            {
              label: "Cargo",
              icons: [Boxes, Package, Container, Wheat, Layers, Anchor],
              maxWidth: "max-w-[400px]",
              isCargo: true
            },
            {
              label: "Passenger",
              icons: [Users],
              maxWidth: "max-w-[200px]",
              isPassenger: true
            }
          ].map((group, idx, arr) => (
            <div key={group.label} className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
              <div className={`flex flex-col items-center flex-1 ${group.maxWidth}`}>
                <div className={`flex items-center gap-4 md:gap-6 mb-4 md:mb-8 h-10 md:h-12`}>
                  {group.icons.map((Icon, i) => (
                    <Icon key={i} className={`${group.isPassenger ? 'w-12 h-12 md:w-16 md:h-16' : 'w-6 h-6 md:w-9 md:h-9'} hover:scale-110 transition-transform cursor-pointer opacity-90`} />
                  ))}
                </div>
                <div className="w-full flex items-center gap-3">
                  <div className="h-[2px] bg-white/40 flex-1" />
                  <span className="text-sm md:text-xl font-bold uppercase tracking-widest whitespace-nowrap">{group.label}</span>
                  <div className="h-[2px] bg-white/40 flex-1" />
                </div>
              </div>
              {idx < arr.length - 1 && (
                <div className="hidden md:block h-24 lg:h-32 w-[1px] bg-white/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScheduleItem({ data, compact = false }: { data: Schedule; compact?: boolean }) {
  if (data.isHoliday) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <span className={`${compact ? 'text-xl' : 'text-[28px]'} font-extrabold text-white tracking-wider`}>Holiday</span>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col justify-center ${compact ? 'p-4 space-y-2' : 'p-6 space-y-4'}`}>
      {!data.events || data.events.length === 0 ? (
        <div className="text-white/40 text-center italic">
          <span className={compact ? 'text-sm' : ''}>No scheduled events</span>
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
                <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-400`} />
                <span className={`${compact ? 'text-base' : 'text-[18px]'} font-bold`}>{fromLoc}</span>
                {toLoc && toLoc !== fromLoc && (
                  <>
                    <ArrowRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    <span className={`${compact ? 'text-base' : 'text-[18px]'} font-bold`}>{toLoc}</span>
                  </>
                )}
              </div>
              {(depTime || arrTime) && (
                <p className={`${compact ? 'text-xs pl-6' : 'text-sm pl-7'} text-white/70 font-semibold`}>
                  {depTime}{depTime && arrTime ? " — " : ""}{arrTime}
                </p>
              )}
              <div className={compact ? 'pl-6' : 'pl-7'}>
                <p className={`${compact ? 'text-sm' : 'text-[18px]'} font-black text-emerald-300 uppercase leading-tight`}>{event.type}</p>
                {stopsCount > 0 && (
                  <p className={`${compact ? 'text-[11px]' : 'text-[14px]'} font-medium text-white/60 flex items-center gap-1`}>
                    <Train className="w-3.5 h-3.5" />
                    {stopsCount} stop{stopsCount > 1 ? 's' : ''}
                  </p>
                )}
                {event.notes && <p className={`${compact ? 'text-[11px]' : 'text-[14px]'} font-medium text-white/80 italic`}>({event.notes})</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Schedule Section
function ScheduleSection() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileActiveShip, setMobileActiveShip] = useState<'A' | 'B'>('A');

  const [shipNameA, setShipNameA] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dsl_ship_a') || 'SHIP_A';
    return 'SHIP_A';
  });
  const [shipNameB, setShipNameB] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('dsl_ship_b') || 'SHIP_B';
    return 'SHIP_B';
  });

  const toLocalISO = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    return new Date(now.setDate(diff));
  });

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

  useEffect(() => {
    async function fetchSchedules() {
      setIsLoading(true);
      setError("");
      try {
        const startDate = toLocalISO(weekDates[0]);
        const endDate = toLocalISO(weekDates[5]);
        const res = await fetch(`/api/schedules?published=true&startDate=${startDate}&endDate=${endDate}&limit=100`);
        const data = await res.json();
        if (res.ok) setSchedules(data.schedules || []);
        else setError(data.error || "Failed to load schedules");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedules();
  }, [currentWeekStart]);

  const getScheduleForDate = (date: Date, shipName: string): Schedule | null => {
    const dateStr = toLocalISO(date);
    return schedules.find(s => toLocalISO(new Date(s.date)) === dateStr && s.shipName === shipName && s.isPublished) || null;
  };

  const navigateWeek = (weeks: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (weeks * 7));
    setCurrentWeekStart(newStart);
  };

  const weekRangeStr = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekDates[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <section className="relative py-12 md:py-24 overflow-hidden min-h-[800px]">
      <img alt="" className="absolute inset-0 w-full h-full object-cover filter brightness-[0.2]" src={imgRectangle490.src} />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8 lg:mb-12 bg-black/40 p-4 lg:p-6 rounded-2xl backdrop-blur-md border border-white/10">
          <button onClick={() => navigateWeek(-1)} className="p-2 lg:px-6 lg:py-2 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-95">
            <ChevronLeft className="w-6 h-6 lg:hidden" />
            <span className="hidden lg:inline text-lg font-bold">← Previous Week</span>
          </button>
          <div className="text-center">
            <p className="text-emerald-400 text-xs lg:text-base font-bold uppercase tracking-widest mb-1">Current Schedule</p>
            <h2 className="text-lg lg:text-3xl font-bold text-white italic">{weekRangeStr}</h2>
          </div>
          <button onClick={() => navigateWeek(1)} className="p-2 lg:px-6 lg:py-2 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-95">
            <ChevronRight className="w-6 h-6 lg:hidden" />
            <span className="hidden lg:inline text-lg font-bold">Next Week →</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-400" /></div>
        ) : error ? (
          <div className="text-center py-20 text-white"><p className="text-xl text-red-400">{error}</p></div>
        ) : (
          <>
            {/* MOBILE VIEW (below lg) */}
            <div className="lg:hidden space-y-6">
              {/* Ship Tabs */}
              <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1 gap-1 border border-white/10">
                <button
                  onClick={() => setMobileActiveShip('A')}
                  className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    mobileActiveShip === 'A' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                  {shipNameA.replace(/_/g, ' ')}
                </button>
                <button
                  onClick={() => setMobileActiveShip('B')}
                  className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    mobileActiveShip === 'B' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Ship className="w-4 h-4" />
                  {shipNameB.replace(/_/g, ' ')}
                </button>
              </div>

              {/* Day Cards */}
              <div className="space-y-4">
                {weekDates.map((date, index) => {
                  const activeShipName = mobileActiveShip === 'A' ? shipNameA : shipNameB;
                  const schedule = getScheduleForDate(date, activeShipName);

                  return (
                    <div key={index} className="rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 shadow-xl">
                      <div className="bg-emerald-900/50 px-4 py-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-lg w-12 h-12 flex flex-col items-center justify-center shadow-lg border-2 border-emerald-900">
                            <span className="text-lg font-black leading-none text-black">{String(date.getDate()).padStart(2, '0')}</span>
                            <span className="text-[10px] font-bold text-emerald-900">{weekdays[index]}</span>
                          </div>
                          <div className="text-white">
                            <p className="text-sm font-bold uppercase tracking-wider">{months[date.getMonth()]}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {schedule ? (
                          <ScheduleItem data={schedule} compact />
                        ) : (
                          <div className="py-8 text-center text-white/30 italic text-sm">
                            No scheduled events
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESKTOP VIEW (lg and above) */}
            <div className="hidden lg:block relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-md">
              {/* Header */}
              <div className="grid grid-cols-[180px_1fr_1fr] bg-emerald-900/40 border-b border-white/20">
                <div className="py-8 text-center flex flex-col items-center justify-center">
                   <Clock className="w-8 h-8 text-emerald-400 mb-2" />
                   <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Time Slot</span>
                </div>
                <div className="py-8 flex flex-col items-center justify-center border-l border-white/20">
                  <Ship className="w-8 h-8 text-white mb-2" />
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">{shipNameA.replace(/_/g, ' ')}</h2>
                </div>
                <div className="py-8 flex flex-col items-center justify-center border-l border-white/20">
                  <Ship className="w-8 h-8 text-white mb-2" />
                  <h2 className="text-3xl font-black text-white tracking-widest uppercase">{shipNameB.replace(/_/g, ' ')}</h2>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/10">
                {weekDates.map((date, index) => {
                  const scheduleA = getScheduleForDate(date, shipNameA);
                  const scheduleB = getScheduleForDate(date, shipNameB);

                  return (
                    <div key={index} className="grid grid-cols-[180px_1fr_1fr] hover:bg-white/5 transition-colors">
                      <div className="p-6 flex flex-col items-center justify-center">
                        <div className="bg-white rounded-xl p-3 w-full aspect-square flex flex-col items-center justify-center shadow-xl border-[4px] border-emerald-900 group-hover:scale-105 transition-transform">
                          <span className="text-[36px] font-black leading-none text-black">{String(date.getDate()).padStart(2, '0')}</span>
                          <span className="text-[20px] font-black text-emerald-900">{weekdays[index]}</span>
                          <span className="text-[14px] font-bold text-black/60 uppercase">{months[date.getMonth()].substring(0, 3)}</span>
                        </div>
                      </div>
                      <div className="border-l border-white/10 flex min-h-[160px]">
                        {scheduleA ? (
                          <ScheduleItem data={scheduleA} />
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-white/20 italic">
                            No events scheduled
                          </div>
                        )}
                      </div>
                      <div className="border-l border-white/10 flex min-h-[160px]">
                        {scheduleB ? (
                          <ScheduleItem data={scheduleB} />
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-white/20 italic">
                            No events scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ScheduleSection />
    </div>
  );
}
