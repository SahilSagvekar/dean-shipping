'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "@/app/assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgRectangle490 from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";

import { Truck, Package, Users, Car, Bike, Bus, Boxes, Container, Layers, Wheat, Anchor } from 'lucide-react';

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
    <section className="relative mt-[135px] h-[842px] overflow-hidden">
      <img alt="" className="absolute inset-0 w-full h-full object-cover" src={imgRectangle4.src} />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative max-w-[1440px] mx-auto px-12 h-full flex flex-col justify-between py-24 text-white">
        {/* Main Title - Positioned Top Left */}
        <div className="mt-12 ml-4">
          <h1 className="text-[75px] font-bold leading-[1.1] drop-shadow-2xl">
            "Fast Tracked,<br />
            &nbsp;&nbsp;Securely Delivered."
          </h1>
        </div>

        {/* Service Groups - Bottom Navigation Style */}
        <div className="flex items-end justify-center gap-10 w-full px-4">

          {/* Vehicle Group */}
          <div className="flex flex-col items-center flex-1 max-w-[280px]">
            <div className="flex items-center gap-6 mb-8 h-12">
              <Car className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
              <Truck className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
              <Bike className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
              <Bus className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
            </div>
            <div className="w-full flex items-center gap-3">
              <div className="h-[2px] bg-white/80 flex-1" />
              <span className="text-xl font-bold uppercase tracking-[0.2em] whitespace-nowrap">Vehicle</span>
              <div className="h-[2px] bg-white/80 flex-1" />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-32 w-[2px] bg-white/60 mb-2" />

          {/* Cargo Group */}
          <div className="flex flex-col items-center flex-1 max-w-[400px]">
            <div className="flex items-center gap-6 mb-8 h-12">
              <Boxes className="w-9 h-9 hover:scale-110 transition-transform cursor-pointer" />
              <Package className="w-9 h-9 hover:scale-110 transition-transform cursor-pointer" />
              <Container className="w-9 h-9 hover:scale-110 transition-transform cursor-pointer" />
              <Wheat className="w-9 h-9 hover:scale-110 transition-transform cursor-pointer" />
              <Layers className="w-9 h-9 hover:scale-110 transition-transform cursor-pointer" />
              <Anchor className="w-9 h-9 hover:scale-110 transition-transform cursor-pointer" />
            </div>
            <div className="w-full flex items-center gap-3">
              <div className="h-[2px] bg-white/80 flex-1" />
              <span className="text-xl font-bold uppercase tracking-[0.2em] whitespace-nowrap">Cargo</span>
              <div className="h-[2px] bg-white/80 flex-1" />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-32 w-[2px] bg-white/60 mb-2" />

          {/* Passenger Group */}
          <div className="flex flex-col items-center flex-1 max-w-[200px]">
            <div className="flex items-center gap-4 mb-8 h-12">
              <Users className="w-14 h-14 hover:scale-110 transition-transform cursor-pointer" />
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-xl font-bold uppercase tracking-[0.2em] whitespace-nowrap">Passenger</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Location Icon Component
function LocationIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 35 35">
      <path d={svgPaths.p19951080} fill="white" />
    </svg>
  );
}

// Schedule Card Component
function ScheduleCard({
  date,
  day,
  month,
  isHoliday,
  events
}: {
  date: string;
  day: string;
  month: string;
  isHoliday?: boolean;
  events?: ScheduleEvent[];
}) {
  return (
    <div className="flex items-center gap-8 min-h-[140px]">
      {/* Date Card */}
      <div className="flex-shrink-0 bg-white border-[3px] border-[#1B4D3E] rounded-none w-[110px] h-[110px] flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-black leading-tight">{date}</div>
        <div className="text-lg font-bold text-black uppercase leading-tight">{day}</div>
        <div className="text-sm font-semibold text-black leading-tight">{month}</div>
      </div>

      {/* Event Details */}
      <div className="flex-1 flex flex-col justify-center">
        {isHoliday ? (
          <div className="text-[28px] font-bold text-white text-center w-full">
            Holiday
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-[20px] text-white/60 text-center w-full">
            No scheduled events
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((e, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {e.location && <LocationIcon className="w-5 h-5 mt-1 flex-shrink-0" />}
                <div>
                  <div className="text-[20px] font-bold text-white leading-tight">
                    {e.location} {e.time && <span className="ml-2 font-semibold">({e.time})</span>}
                  </div>
                  <div className="text-[22px] font-extrabold text-white uppercase leading-tight">
                    {e.type}
                  </div>
                  {e.notes && (
                    <div className="text-[17px] font-medium text-white opacity-90 leading-tight">
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

  // Get week dates
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

  // Fetch published schedules
  useEffect(() => {
    async function fetchSchedules() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/schedules?published=true&limit=100`);
        const data = await res.json();
        
        if (res.ok) {
          setSchedules(data.schedules || []);
        } else {
          setError(data.error || "Failed to load schedules");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedules();
  }, [currentWeekStart]);

  // Get schedule for specific date and ship
  const getScheduleForDate = (date: Date, shipName: string): Schedule | null => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(s => 
      s.date.split('T')[0] === dateStr && s.shipName === shipName && s.isPublished
    ) || null;
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

  // Build schedule arrays for Ship A and Ship B
  const shipASchedule = weekDates.map((date, index) => {
    const schedule = getScheduleForDate(date, "SHIP_A");
    return {
      date: String(date.getDate()).padStart(2, '0'),
      day: weekdays[index],
      month: months[date.getMonth()],
      isHoliday: schedule?.isHoliday || false,
      events: schedule?.events || []
    };
  });

  const shipBSchedule = weekDates.map((date, index) => {
    const schedule = getScheduleForDate(date, "SHIP_B");
    return {
      date: String(date.getDate()).padStart(2, '0'),
      day: weekdays[index],
      month: months[date.getMonth()],
      isHoliday: schedule?.isHoliday || false,
      events: schedule?.events || []
    };
  });

  return (
    <section className="relative py-24 overflow-hidden">
      <img alt="" className="absolute inset-0 w-full h-full object-cover filter brightness-50" src={imgRectangle490.src} />

      <div className="relative max-w-[1200px] mx-auto px-8">
        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <button
            onClick={prevWeek}
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[5].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          <button
            onClick={nextWeek}
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-white">
            <p className="text-xl">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-20">
            {/* Ship A */}
            <div className="relative">
              <h2 className="text-[50px] font-bold text-white text-center mb-16 tracking-wider">SHIP A</h2>
              <div className="divide-y divide-white/60">
                {shipASchedule.map((schedule, index) => (
                  <div key={index} className="py-6 first:pt-0 last:pb-0">
                    <ScheduleCard {...schedule} />
                  </div>
                ))}
              </div>
            </div>

            {/* Ship B */}
            <div className="relative">
              <h2 className="text-[50px] font-bold text-white text-center mb-16 tracking-wider">SHIP B</h2>
              <div className="divide-y divide-white/60">
                {shipBSchedule.map((schedule, index) => (
                  <div key={index} className="py-6 first:pt-0 last:pb-0">
                    <ScheduleCard {...schedule} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vertical Divider */}
        <div className="absolute left-1/2 top-48 bottom-0 w-[2px] bg-white/60 -translate-x-1/2" />
      </div>
    </section>
  );
}

// Main Schedule Page
export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ScheduleSection />
    </div>
  );
}
