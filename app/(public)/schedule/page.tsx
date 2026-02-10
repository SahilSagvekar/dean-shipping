'use client';

import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "@/app/assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgRectangle490 from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";

import { Truck, Package, Users, Car, Bike, Bus, Boxes, Container, Layers, Wheat, Anchor } from 'lucide-react';

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
interface ScheduleEvent {
  location: string;
  eventType: string;
  time: string;
  note?: string;
}

function ScheduleCard({
  date,
  day,
  month,
  event,
  events
}: {
  date: string;
  day: string;
  month: string;
  event?: ScheduleEvent | 'holiday';
  events?: ScheduleEvent[];
}) {
  const allEvents = events ? events : (event && event !== 'holiday' ? [event] : []);
  const isHoliday = event === 'holiday';

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
        ) : (
          <div className="space-y-3">
            {allEvents.map((e, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {e.location && <LocationIcon className="w-5 h-5 mt-1 flex-shrink-0" />}
                <div>
                  <div className="text-[20px] font-bold text-white leading-tight">
                    {e.location} <span className="ml-2 font-semibold"> {e.time}</span>
                  </div>
                  <div className="text-[22px] font-extrabold text-white uppercase leading-tight">
                    {e.eventType}
                  </div>
                  {e.note && (
                    <div className="text-[17px] font-medium text-white opacity-90 leading-tight">
                      {e.note}
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
  const shipASchedule = [
    {
      date: "05",
      day: "MON",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Drop Off",
        note: "(Dry Freight Only)"
      }
    },
    {
      date: "06",
      day: "TUE",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Drop Off",
        note: "(Include Freezer & Cooler items)"
      }
    },
    {
      date: "07",
      day: "WED",
      month: "January",
      event: 'holiday' as const
    },
    {
      date: "08",
      day: "THU",
      month: "January",
      event: {
        location: "Marsh Harbour",
        time: "(10am - 4pm)",
        eventType: "Freight Drop Off",
        note: ""
      }
    },
    {
      date: "09",
      day: "FRI",
      month: "January",
      events: [
        {
          location: "Marsh Harbour",
          time: "(10am - 4pm)",
          eventType: "Freight Drop Off",
          note: ""
        },
        {
          location: "Green Turtle Cay",
          time: "(9am - 2pm)",
          eventType: "Freight Drop Off",
          note: ""
        },
        {
          location: "",
          time: "(9am - 2pm)",
          eventType: "Freight Drop Off",
          note: ""
        }
      ]
    },
    {
      date: "10",
      day: "SAT",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Drop Off",
        note: "(Dry Freight Only)"
      }
    }
  ];

  const shipBSchedule = [
    {
      date: "05",
      day: "MON",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Drop Off",
        note: "(Dry Freight Only)"
      }
    },
    {
      date: "06",
      day: "TUE",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Drop Off",
        note: "(Dry Freight Only)"
      }
    },
    {
      date: "07",
      day: "WED",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Pick Up",
        note: "(Dry Freight Only)"
      }
    },
    {
      date: "08",
      day: "THU",
      month: "January",
      events: [
        {
          location: "Marsh Harbour",
          time: "(10am - 4pm)",
          eventType: "Freight Drop Off",
          note: ""
        },
        {
          location: "Green Turtle Cay",
          time: "",
          eventType: "Freight Drop Off",
          note: "Freight Drop Off"
        }
      ]
    },
    {
      date: "09",
      day: "FRI",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Drop Off",
        note: "(Dry Freight Only)"
      }
    },
    {
      date: "10",
      day: "SAT",
      month: "January",
      event: {
        location: "Nassau",
        time: "(8am - 3pm)",
        eventType: "Freight Pick-up",
        note: "The Berry Island"
      }
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <img alt="" className="absolute inset-0 w-full h-full object-cover filter brightness-50" src={imgRectangle490.src} />

      <div className="relative max-w-[1200px] mx-auto px-8">
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
