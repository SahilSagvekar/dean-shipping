import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "../assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgEllipse10 from "../assets/bf9cd628ad5f00dd322c5f93f026d17b58691ba9.png";
import imgEllipse11 from "../assets/346182195ff46a2a07dc2451f19eb7228d7596a1.png";
import imgRectangle44 from "../assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle56 from "../assets/c65da6ab6f4bda8a2bd7648a2be4287c1ac755df.png";
import imgRectangle1 from "../assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import imgRectangle490 from "../assets/cf53a64ce492864216e5a9b357abee066ed01103.png";

import { Truck, Ship, Package, Users, Car, Bike, Bus, Boxes, Container, Archive, Layers, Wheat, Anchor } from 'lucide-react';

// Header Component
function Header({ currentPage = 'schedule' }: { currentPage?: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="w-[339px] h-24">
          <img alt="Dean's Shipping Ltd." className="w-full h-full object-cover" src={imgRectangle1.src} />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-12">
          <div className="relative">
            <a href="#schedule" className="text-xl text-black hover:text-[#296341] transition-colors">
              Schedule
            </a>
            {currentPage === 'schedule' && (
              <div className="absolute left-0 right-0 h-[3px] bg-[#296341] rounded-full mt-1" />
            )}
          </div>
          <a href="#about" className="text-xl text-black hover:text-[#296341] transition-colors">
            About Us
          </a>
          <a href="#shipment" className="text-xl text-black hover:text-[#296341] transition-colors">
            Your Shipment
          </a>
          <a href="#pay" className="text-xl text-black hover:text-[#296341] transition-colors">
            Pay Now
          </a>
          <a href="#contact" className="text-xl text-black hover:text-[#296341] transition-colors">
            Contact Us
          </a>
          <button className="bg-[#296341] border border-[#296341] text-white px-8 py-3 rounded-[10px] text-xl font-bold hover:bg-[#1e4a2f] transition-colors">
            LOGIN
          </button>
        </nav>
      </div>
    </header>
  );
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

// Footer
function Footer() {
  return (
    <footer className="bg-[#5f8a71] text-white py-16 px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Logo */}
        <div className="mb-12">
          <img alt="Dean's Shipping Ltd." className="h-[86px] w-[298px] object-cover" src={imgRectangle44.src} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Head Office */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Head office</h3>

            <div className="space-y-6 text-xl">
              <div>
                <p className="text-[22px] font-semibold mb-2">Nassau, The Bahamas</p>
                <p className="font-normal">Parkgate Road</p>
                <p className="font-normal">P.O. Box EE-17318</p>
                <p className="font-normal mt-2">CALL: 1.242.394.0245/6</p>
              </div>

              <div>
                <p className="text-[22px] font-semibold mb-2">Potter's Cay</p>
                <p className="font-normal">CALL: 1.242.601.5121</p>
              </div>

              <div>
                <p className="text-[22px] font-semibold mb-2">Abaco, The Bahamas</p>
                <p className="font-normal">Queen's Highway (at Port)</p>
                <p className="font-normal">CALL: 1.242.367.2389</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-xl font-medium">
              <li><a href="#about" className="hover:underline">About Us</a></li>
              <li><a href="#book" className="hover:underline">Book now</a></li>
              <li><a href="#contact" className="hover:underline">Contact us</a></li>
              <li><a href="#terms" className="hover:underline">Terms & Condition</a></li>
              <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p995f500} fill="white" />
                </svg>
                <a href="mailto:contact@contact.com" className="text-xl font-light hover:underline">
                  contact@contact.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.pe263670} fill="white" />
                  <path d={svgPaths.p5e7740} fill="white" />
                </svg>
                <span className="text-xl font-light">+1 98765 43210</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-2xl font-medium mb-4">Follow us on</p>
              <div className="flex items-center gap-4">
                <a href="#instagram" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p24edac00} fill="url(#paint0_radial_footer)" />
                    <path d={svgPaths.p24edac00} fill="url(#paint1_radial_footer)" />
                    <path d={svgPaths.p3f139100} fill="white" />
                    <defs>
                      <radialGradient cx="0" cy="0" gradientTransform="translate(6.375 25.8485) rotate(-90) scale(23.7858 22.1227)" gradientUnits="userSpaceOnUse" id="paint0_radial_footer" r="1">
                        <stop stopColor="#FFDD55" />
                        <stop offset="0.1" stopColor="#FFDD55" />
                        <stop offset="0.5" stopColor="#FF543E" />
                        <stop offset="1" stopColor="#C837AB" />
                      </radialGradient>
                      <radialGradient cx="0" cy="0" gradientTransform="translate(-4.02009 1.72884) rotate(78.681) scale(10.6324 43.827)" gradientUnits="userSpaceOnUse" id="paint1_radial_footer" r="1">
                        <stop stopColor="#3771C8" />
                        <stop offset="0.128" stopColor="#3771C8" />
                        <stop offset="1" stopColor="#6600FF" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                </a>

                <a href="#facebook" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p1fdd2200} fill="#1877F2" />
                    <path d={svgPaths.p23faaa00} fill="white" />
                  </svg>
                </a>

                <a href="#linkedin" className="hover:opacity-80 transition-opacity" aria-label="LinkedIn">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p24edac00} fill="white" />
                    <path d={svgPaths.p24edac00} fill="#0A66C2" />
                    <path d={svgPaths.pf9a8e00} fill="white" />
                  </svg>
                </a>

                <a href="#twitter" className="hover:opacity-80 transition-opacity" aria-label="Twitter">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <rect fill="white" height="16" width="18" x="3" y="4" />
                    <path clipRule="evenodd" d={svgPaths.p2a062900} fill="#5F8A71" fillRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/30 pt-8 text-center">
          <p className="text-xl font-medium">Dean's Shipping Ltd. © 2025. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}

// Main Schedule Page
export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* <Header currentPage="schedule" /> */}
      <Hero />
      <ScheduleSection />
      {/* <Footer /> */}
    </div>
  );
}
