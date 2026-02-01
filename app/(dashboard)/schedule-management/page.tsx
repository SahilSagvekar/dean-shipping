"use client"

import { useState } from 'react';
import { MapPin, Check, ChevronDown } from 'lucide-react';
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgHero from "@/app/assets/b493fe526d34a8d0e654480300ff88ab45d2dde1.png";
import imgShipBg from "@/app/assets/cf53a64ce492864216e5a9b357abee066ed01103.png";

// Import Sidebar components
import { SidebarProvider, Sidebar, HamburgerButton } from '@/components/sidebar';

const schedules = [
  {
    day: '05',
    weekday: 'MON',
    month: 'January',
    shipA: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Drop Off',
      notes: '(Dry Freight Only)'
    },
    shipB: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Drop Off',
      notes: '(Dry Freight Only)'
    }
  },
  {
    day: '06',
    weekday: 'TUE',
    month: 'January',
    shipA: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Drop Off',
      notes: '(Include Freezer & Cooler items)'
    },
    shipB: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Drop Off',
      notes: '(Dry Freight Only)'
    }
  },
  {
    day: '07',
    weekday: 'WED',
    month: 'January',
    shipA: {
      isHoliday: true
    },
    shipB: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Pick Up',
      notes: '(Dry Freight Only)'
    }
  },
  {
    day: '08',
    weekday: 'THU',
    month: 'January',
    shipA: {
      location: 'Marsh Harbour',
      time: '10am - 4pm',
      type: 'Freight Drop Off'
    },
    shipB: [
      {
        location: 'Marsh Harbour',
        time: '10am - 4pm',
        type: 'Freight Drop Off'
      },
      {
        location: 'Green Turtle Cay',
        type: 'Freight Drop Off'
      }
    ]
  },
  {
    day: '09',
    weekday: 'FRI',
    month: 'January',
    shipA: [
      {
        location: 'Marsh Harbour',
        time: '10am - 4pm',
        type: 'Freight Drop Off'
      },
      {
        location: 'Green Turtle Cay',
        time: '9am - 2pm',
        type: 'Freight Drop Off'
      }
    ],
    shipB: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Drop Off',
      notes: '(Dry Freight Only)'
    }
  },
  {
    day: '10',
    weekday: 'SAT',
    month: 'January',
    shipA: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Drop Off',
      notes: '(Dry Freight Only)'
    },
    shipB: {
      location: 'Nassau',
      time: '8am - 3pm',
      type: 'Freight Pick-up',
      notes: 'The Berry Island'
    }
  }
];

function ScheduleItem({ data }: { data: any }) {
  if (data.isHoliday) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <span className="text-[32px] font-extrabold text-white tracking-wider">Holiday</span>
      </div>
    );
  }

  const items = Array.isArray(data) ? data : [data];

  return (
    <div className="flex-1 flex flex-col justify-center p-6 space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="text-white">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 fill-white text-white" />
            <span className="text-[22px] font-bold">{item.location}</span>
            {item.time && <span className="text-[22px] font-bold ml-2">({item.time})</span>}
          </div>
          <div className="pl-7">
            <p className="text-[20px] font-bold leading-tight">{item.type}</p>
            {item.notes && <p className="text-[16px] font-medium opacity-90">{item.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleManagementContent() {
  return (
    <div className="min-h-screen bg-white flex flex-col pt-[80px]">
      <Sidebar logoSrc={imgLogo.src} />

      <div className="px-8 py-4">
        <HamburgerButton iconSize={48} />
      </div>

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
        <div className="mb-12">
          <h1 className="text-[36px] font-bold text-black mb-1">SCHEDULE MANAGEMENT</h1>
          <div className="h-[4px] bg-black w-[180px]" />
        </div>

        {/* Schedule Grid with Ship Background */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={imgShipBg.src} alt="" className="w-full h-full object-cover brightness-[0.4]" />
          </div>

          <div className="relative z-10">
            {/* Table Header */}
            <div className="grid grid-cols-[180px_1fr_1fr] bg-black/20 backdrop-blur-sm border-b border-white/20">
              <div />
              <div className="py-8 text-center">
                <h2 className="text-[48px] font-bold text-white tracking-[0.2em]">SHIP A</h2>
              </div>
              <div className="py-8 text-center border-l border-white/20">
                <h2 className="text-[48px] font-bold text-white tracking-[0.2em]">SHIP B</h2>
              </div>
            </div>

            {/* Schedule Rows */}
            <div className="divide-y divide-white/20">
              {schedules.map((row, index) => (
                <div key={index} className="grid grid-cols-[180px_1fr_1fr]">
                  {/* Date Column */}
                  <div className="p-4 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-lg p-2 w-full aspect-square flex flex-col items-center justify-center shadow-lg border-[3px] border-[#296341]">
                      <span className="text-[36px] font-black leading-none">{row.day}</span>
                      <span className="text-[22px] font-bold">{row.weekday}</span>
                      <span className="text-[16px] font-medium">{row.month}</span>
                    </div>
                  </div>

                  {/* Ship A Sched */}
                  <div className="border-l border-white/20 flex">
                    <ScheduleItem data={row.shipA} />
                  </div>

                  {/* Ship B Sched */}
                  <div className="border-l border-white/20 flex">
                    <ScheduleItem data={row.shipB} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-8">
          <div className="flex-1 min-w-[600px] flex items-center gap-4 bg-[#f8fafc] border border-gray-200 rounded-lg p-4 shadow-sm">
            <span className="text-[20px] font-bold text-[#296341] whitespace-nowrap">Schedule to Launch</span>
            <div className="flex items-center gap-6 text-[22px] font-medium text-gray-700 bg-white px-6 py-2 rounded-md border border-gray-100 flex-1">
              <span>22 / 12 / 2 0 2 5</span>
              <span>1 2 : 0 0 am</span>
            </div>
            <button className="bg-[#296341] text-white px-6 py-2 rounded-md flex items-center gap-2 font-bold hover:bg-[#1a422b] transition-colors">
              Schedule <Check className="w-5 h-5" />
            </button>
          </div>

          <button className="bg-[#132540] text-white px-10 py-4 rounded-lg text-[22px] font-bold hover:bg-[#1a3254] transition-all shadow-md active:scale-95">
            Launch Now
          </button>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="bg-[#296341] py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={imgLogo.src} alt="Dean's Shipping Ltd" className="h-[70px]" />
          </div>
          <div className="text-white text-[28px] font-semibold">
            Dock Manager | <span className="font-normal">Smith Davidson</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ScheduleManagement() {
  return (
    <SidebarProvider>
      <ScheduleManagementContent />
    </SidebarProvider>
  );
}
