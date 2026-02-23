"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, ChevronLeft, ChevronRight, Truck, Package, Users, Car, Bike, Bus, Boxes, Container, Layers, Wheat, Anchor } from "lucide-react";
import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "@/app/assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgRectangle490 from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";

// Types
interface ScheduleEvent {
  id: string;
  location: string;
  time: string;
  type: string;
  notes: string;
}

interface Schedule {
  id: string;
  date: string;
  weekday: string;
  month: string;
  shipName: string;
  isHoliday: boolean;
  isPublished: boolean;
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

// Schedule Card Component
function ScheduleCard({ date, day, month, isHoliday, events }: any) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 min-h-[120px] md:min-h-[140px] group transition-all duration-300">
      {/* Date Card */}
      <div className="flex-shrink-0 bg-white border-2 md:border-[3px] border-emerald-900 rounded-lg sm:rounded-none w-20 h-20 md:w-[110px] md:h-[110px] flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
        <div className="text-xl md:text-3xl font-bold text-black leading-tight">{date}</div>
        <div className="text-sm md:text-lg font-bold text-black uppercase leading-tight">{day}</div>
        <div className="text-[10px] md:text-sm font-semibold text-black/60 leading-tight">{month}</div>
      </div>

      {/* Event Details */}
      <div className="flex-1 flex flex-col justify-center w-full">
        {isHoliday ? (
          <div className="text-xl md:text-[28px] font-bold text-white bg-red-500/20 py-2 px-4 rounded-lg backdrop-blur-sm border border-red-500/30 text-center w-full">
            Holiday
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-sm md:text-[20px] text-white/40 italic text-center w-full">
            No scheduled events
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <MapPin className="w-5 h-5 mt-1 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-lg md:text-[20px] font-bold text-white leading-tight mb-1">
                    {e.location} {e.time && <span className="ml-2 font-semibold text-white/70">({e.time})</span>}
                  </div>
                  <div className="text-base md:text-[22px] font-black text-emerald-300 uppercase leading-tight mb-1">
                    {e.type}
                  </div>
                  {e.notes && (
                    <div className="text-sm md:text-[17px] font-medium text-white/80 leading-tight italic">
                      ({e.notes})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Schedule Section
function ScheduleSection() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
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
        const res = await fetch(`/api/schedules?published=true&limit=100`);
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
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(s => s.date.split('T')[0] === dateStr && s.shipName === shipName && s.isPublished) || null;
  };

  const navigateWeek = (weeks: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (weeks * 7));
    setCurrentWeekStart(newStart);
  };

  const getWeekSchedule = (shipName: string) => weekDates.map((date, index) => {
    const schedule = getScheduleForDate(date, shipName);
    return {
      date: String(date.getDate()).padStart(2, '0'),
      day: weekdays[index],
      month: months[date.getMonth()],
      isHoliday: schedule?.isHoliday || false,
      events: schedule?.events || []
    };
  });

  return (
    <section className="relative py-12 md:py-24 overflow-hidden min-h-[800px]">
      <img alt="" className="absolute inset-0 w-full h-full object-cover filter brightness-[0.2]" src={imgRectangle490.src} />

      <div className="relative max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Week Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 md:mb-20 bg-black/40 p-4 md:p-6 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <button onClick={() => navigateWeek(-1)} className="bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition-all active:scale-90"><ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /></button>
            <button onClick={() => navigateWeek(1)} className="bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition-all active:scale-90"><ChevronRight className="w-6 h-6 md:w-8 md:h-8" /></button>
          </div>
          <div className="text-center order-1 sm:order-2">
            <p className="text-emerald-400 text-sm md:text-base font-bold uppercase tracking-widest mb-1">Current Schedule</p>
            <h2 className="text-lg md:text-3xl font-bold text-white italic">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-400" /></div>
        ) : error ? (
          <div className="text-center py-20 text-white"><p className="text-xl text-red-400">{error}</p></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 relative">
            {/* Ships */}
            {[
              { name: "SHIP A", data: getWeekSchedule("SHIP_A") },
              { name: "SHIP B", data: getWeekSchedule("SHIP_B") }
            ].map((ship, idx) => (
              <div key={ship.name} className="relative">
                <div className="flex items-center gap-4 mb-10 md:mb-16">
                  <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-emerald-500/50" />
                  <h2 className="text-3xl md:text-[50px] font-black text-white tracking-widest">{ship.name}</h2>
                  <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-emerald-500/50" />
                </div>
                <div className="space-y-8 md:space-y-12">
                  {ship.data.map((schedule, sIdx) => (
                    <div key={sIdx} className="relative pb-8 md:pb-12 border-b border-white/10 last:border-0 last:pb-0">
                      <ScheduleCard {...schedule} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Desktop Vertical Divider */}
            <div className="hidden lg:block absolute left-1/2 top-24 bottom-0 w-[1px] bg-gradient-to-b from-emerald-500/50 via-white/20 to-transparent -translate-x-1/2" />
          </div>
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
