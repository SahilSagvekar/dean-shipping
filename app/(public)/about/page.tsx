'use client';

import { useState } from 'react';
import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "../../assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgEllipse10 from "../../assets/bf9cd628ad5f00dd322c5f93f026d17b58691ba9.png";
import imgEllipse11 from "../../assets/346182195ff46a2a07dc2451f19eb7228d7596a1.png";
import imgRectangle44 from "../../assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle56 from "../../assets/c65da6ab6f4bda8a2bd7648a2be4287c1ac755df.png";
// import imgRectangle1 from "../assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import imgRectangle1 from "../../assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import SchedulePage from '@/components/SchedulePage';

// Header Component
function Header({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="w-[339px] h-24 cursor-pointer" onClick={() => onNavigate('home')}>
          <img alt="Dean's Shipping Ltd." className="w-full h-full object-cover" src={imgRectangle1.src} />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-12">
          <div className="relative">
            <button onClick={() => onNavigate('schedule')} className="text-xl text-black hover:text-[#296341] transition-colors">
              Schedule
            </button>
            {currentPage === 'schedule' && (
              <div className="absolute left-0 right-0 h-[3px] bg-[#296341] rounded-full mt-1" />
            )}
          </div>
          <div className="relative">
            <button onClick={() => onNavigate('home')} className="text-xl text-black hover:text-[#296341] transition-colors">
              About Us
            </button>
            {currentPage === 'home' && (
              <div className="absolute left-0 right-0 h-[3px] bg-[#296341] rounded-full mt-1" />
            )}
          </div>
          <button onClick={() => onNavigate('home')} className="text-xl text-black hover:text-[#296341] transition-colors">
            Your Shipment
          </button>
          <button onClick={() => onNavigate('home')} className="text-xl text-black hover:text-[#296341] transition-colors">
            Pay Now
          </button>
          <button onClick={() => onNavigate('home')} className="text-xl text-black hover:text-[#296341] transition-colors">
            Contact Us
          </button>
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
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative max-w-[1440px] mx-auto px-8 h-full flex flex-col items-center justify-center text-white">
        <h1 className="text-[70px] font-bold mb-4" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.5)' }}>
          Welcome to
        </h1>
        <h2 className="text-[80px] font-bold mb-16" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.5)' }}>
          Dean's Shipping Ltd.
        </h2>

        {/* Service Icons */}
        <div className="flex items-center gap-16">
          {/* Vehicle Deck */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <VehicleIcon1 />
              <VehicleIcon2 />
              <VehicleIcon3 />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-20 bg-white rounded-full" />
              <span className="text-lg font-medium whitespace-nowrap">Vehicle</span>
              <div className="h-[2px] w-20 bg-white rounded-full" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-[118px] w-[2px] bg-white" />

          {/* Cargo Deck */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <CargoIcon1 />
              <CargoIcon2 />
              <CargoIcon3 />
              <CargoIcon4 />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-[120px] bg-white rounded-full" />
              <span className="text-lg font-medium">Cargo</span>
              <div className="h-[2px] w-[120px] bg-white rounded-full" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-[118px] w-[2px] bg-white" />

          {/* Passengers */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <PassengerIcon />
            </div>
            <span className="text-lg font-medium">Passengers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Icon Components
function VehicleIcon1() {
  return (
    <svg className="w-[51px] h-[28px]" fill="none" viewBox="0 0 51 28">
      <path d={svgPaths.p1423b00} fill="white" />
    </svg>
  );
}

function VehicleIcon2() {
  return (
    <svg className="w-10 h-8" fill="none" viewBox="0 0 40 32">
      <path d={svgPaths.p25b8500} fill="white" />
    </svg>
  );
}

function VehicleIcon3() {
  return (
    <svg className="w-[50px] h-10" fill="none" viewBox="0 0 50 40">
      <path d={svgPaths.p5493a00} fill="white" />
    </svg>
  );
}

function CargoIcon1() {
  return (
    <svg className="w-[35px] h-[35px]" fill="none" viewBox="0 0 35 35">
      <path d={svgPaths.p171fc040} fill="white" />
    </svg>
  );
}

function CargoIcon2() {
  return (
    <svg className="w-[35px] h-[35px]" fill="none" viewBox="0 0 35 35">
      <path d={svgPaths.p34458100} fill="white" />
    </svg>
  );
}

function CargoIcon3() {
  return (
    <svg className="w-[35px] h-[35px]" fill="none" viewBox="0 0 35 35">
      <path clipRule="evenodd" d={svgPaths.p375a2980} fill="white" fillRule="evenodd" />
      <path d={svgPaths.p1782c100} fill="white" />
    </svg>
  );
}

function CargoIcon4() {
  return (
    <svg className="w-[43px] h-[29px]" fill="none" viewBox="0 0 44.5154 29.4228">
      <path d={svgPaths.pda80940} stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d={svgPaths.p225369c0} stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d={svgPaths.p15e18000} stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d={svgPaths.pe695880} stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d={svgPaths.p3e1bd500} stroke="white" strokeLinecap="round" strokeWidth="2" />
      <path d={svgPaths.p1d4fe3c0} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p3a53c300} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p2a1a9600} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p3a17900} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p12a44100} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p7068380} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p39492c00} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p3b46d780} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p26b1bd80} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p7a25100} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p28293900} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p2eea2680} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p24bbe080} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p1153d3c0} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p31766900} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p1e63b400} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p3ae9db00} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.pb234280} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p319c4b80} stroke="white" strokeLinecap="round" />
      <path d={svgPaths.p1a9d0750} stroke="white" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function PassengerIcon() {
  return (
    <svg className="w-[90px] h-[90px]" fill="none" viewBox="0 0 90 90">
      <path d={svgPaths.pbf1b000} fill="white" />
      <path d={svgPaths.p15cfd480} fill="white" />
      <path d={svgPaths.p3e499b00} fill="white" />
      <path d={svgPaths.p2a566200} fill="white" />
      <path d={svgPaths.p227f5e00} fill="white" />
      <path d={svgPaths.p1a29ef80} fill="white" />
      <path d={svgPaths.p927e480} fill="white" />
      <path d={svgPaths.p443d180} fill="white" />
      <path d={svgPaths.p338ca200} fill="#211715" />
      <path d={svgPaths.p38d10100} fill="white" />
      <path d={svgPaths.p3dcce9c0} fill="white" />
      <path d={svgPaths.p1b40cd00} fill="#211715" />
      <path d={svgPaths.p306e0100} fill="#211715" />
      <path d={svgPaths.p3867a800} fill="#211715" />
      <path d={svgPaths.p1eead400} fill="white" />
      <path d={svgPaths.p9d58e00} fill="#211715" />
      <path d={svgPaths.p36803570} fill="#211715" />
      <path d={svgPaths.p3a9b1900} fill="#211715" />
      <path d={svgPaths.p1e69e900} fill="#211715" />
      <path d={svgPaths.p395c6280} fill="#211715" />
      <path d={svgPaths.p342f1f80} fill="#211715" />
      <path d={svgPaths.pd421000} fill="#211715" />
      <path d={svgPaths.p234fea80} fill="#211715" />
      <path d={svgPaths.p1462e000} fill="#211715" />
      <path d={svgPaths.p3d89c880} fill="#211715" />
      <path d={svgPaths.p21ddeb00} fill="#211715" />
      <path d={svgPaths.p1878a500} fill="#211715" />
      <path d={svgPaths.p2f514d00} fill="#211715" />
      <path d={svgPaths.p7ae5400} fill="#211715" />
      <path d={svgPaths.p1e179000} fill="#211715" />
      <path d={svgPaths.p23571400} fill="#211715" />
      <path d={svgPaths.p11488a00} fill="#211715" />
      <path d={svgPaths.p366a9000} fill="white" />
      <path d={svgPaths.pbc8c080} fill="#211715" />
      <path d={svgPaths.p52f9900} fill="#211715" />
      <path d={svgPaths.p8328880} fill="#211715" />
      <path d={svgPaths.p24d0f00} fill="#211715" />
      <path d={svgPaths.p9dd7400} fill="#211715" />
      <path d={svgPaths.p3ac22700} fill="#211715" />
      <path d={svgPaths.p377ab000} fill="#211715" />
      <path d={svgPaths.p65cb9c0} fill="#211715" />
      <path d={svgPaths.p2d179600} fill="#211715" />
      <path d={svgPaths.p3f65900} fill="#211715" />
      <path d={svgPaths.p28c42180} fill="#211715" />
      <path d={svgPaths.p27608e80} fill="#211715" />
      <path d={svgPaths.p279bc800} fill="#211715" />
      <path d={svgPaths.p125f000} fill="#211715" />
      <path d={svgPaths.p17072900} fill="#211715" />
      <path d={svgPaths.p3c096600} fill="#211715" />
      <path d={svgPaths.p314eaa80} fill="white" />
      <path d={svgPaths.p1065c580} fill="white" />
      <path d={svgPaths.pb75c980} fill="#211715" />
      <path d={svgPaths.p1ecfed80} fill="#211715" />
      <path d={svgPaths.pae4b580} fill="#211715" />
      <path d={svgPaths.p3b29ec00} fill="#211715" />
      <path d={svgPaths.p26ed100} fill="#211715" />
      <path d={svgPaths.p3a8b4500} fill="#211715" />
      <path d={svgPaths.p22e84a00} fill="#211715" />
      <path d={svgPaths.p10ea7980} fill="#211715" />
      <path d={svgPaths.p3a6069c0} fill="#211715" />
      <path d={svgPaths.p1c43cff0} fill="#211715" />
      <path d={svgPaths.p325a7ea0} fill="#211715" />
      <path d={svgPaths.p3d5bf900} fill="#211715" />
      <path d={svgPaths.p19d61880} fill="#211715" />
      <path d={svgPaths.p1d762880} fill="#211715" />
      <path d={svgPaths.pa4e0a10} fill="#211715" />
      <path d={svgPaths.p1a69b900} fill="#211715" />
      <path d={svgPaths.p2edb8880} fill="white" />
      <path d={svgPaths.p359be00} fill="white" />
      <path d={svgPaths.p3d5d8e00} fill="#211715" />
      <path d={svgPaths.p360dfa00} fill="white" />
      <path d={svgPaths.p1274fb00} fill="white" />
      <path d={svgPaths.p28770000} fill="white" />
      <path d={svgPaths.p29f43b00} fill="white" />
      <path d={svgPaths.p11212500} fill="white" />
      <path d={svgPaths.p99b780} fill="white" />
    </svg>
  );
}

// About Us Section
function AboutSection() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-[1077px] mx-auto">
          <h2 className="text-[40px] font-semibold text-[#296341] mb-12">About Us</h2>

          <p className="text-[28px] font-light text-black leading-relaxed mb-8">
            We are a Bahamas-based company that specializes in mailboat services to North Abaco Bahamas. We also provide international aggregate charting services across the globe. With our fleet of two large shipping vessels, we are equipped to meet the transportation needs of businesses and individuals across different industries.
          </p>

          <p className="text-[28px] font-light text-black leading-relaxed">
            At Dean's Shipping Ltd., we are committed to providing exceptional services that meet the unique needs of our clients. We pride ourselves on our dedication to customer satisfaction, and our experienced team is always available to answer any questions you may have. Whether you need mailboat shipping services or international aggregate charting, Dean's Shipping Ltd. is your go-to partner for reliable and efficient transportation solutions.
          </p>
        </div>
      </div>
    </section>
  );
}

// Operations Section
function OperationsSection() {
  return (
    <section className="py-24 px-8 bg-[#effaf6]">
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-[1103px] mx-auto">
          <h2 className="text-[40px] font-semibold text-[#296341] mb-12">OUR OPERATIONS</h2>

          <p className="text-[28px] text-black leading-relaxed mb-8">
            Dean's Shipping Company is owned and operated by Ernest Dean Jr. and their Family. The Dean name is synonymous with shipping throughout The Bahamas, with more than 70 years of experience in freight hauling. The M/V Champion III, is locally owned and operated, and licensed for aggregate services and for inter-island transport within The Bahamas.
          </p>

          <p className="text-[28px] text-black leading-relaxed">
            Dean's Shipping Co. Ltd. has been overseeing the mailboat services for Marsh Harbour, North Abaco, and the surrounding keys for the last 18 years using our famous vessel - The Legacy. In addition to aggregate services, we offer affordable charter services to Florida and the Northern Caribbean.
          </p>
        </div>
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  return (
    <section className="py-24 px-8 bg-[#effaf6]">
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-[1280px] mx-auto space-y-24">
          {/* Ernest Dean Jr. */}
          <div className="flex gap-16 items-start">
            <div className="flex-shrink-0 w-[300px] h-[300px] rounded-full overflow-hidden">
              <img alt="Ernest Dean Jr." className="w-full h-full object-cover" src={imgEllipse10.src} />
            </div>
            <div className="flex-1">
              <h3 className="text-[40px] font-semibold text-[#296341] mb-8">Ernest Dean Jr. | Owner</h3>
              <p className="text-[28px] text-black leading-relaxed mb-6">
                Ernest Dean Jr. was born on February 27, 1962 as the last child to Captain Ernest and Mrs. Eula Dean. Birthed into a family of seafarers, it was only natural that he too would be drawn to the call of the sea. His introduction to life on the boat came at the age of 8…
              </p>
              <button className="text-[28px] font-medium text-black hover:text-[#296341] transition-colors">
                Learn More....
              </button>
            </div>
          </div>

          {/* Ernest Dean */}
          <div className="flex gap-16 items-start">
            <div className="flex-shrink-0 w-[300px] h-[300px] rounded-full overflow-hidden">
              <img alt="Ernest Dean" className="w-full h-full object-cover" src={imgEllipse11.src} />
            </div>
            <div className="flex-1">
              <h3 className="text-[40px] font-semibold text-[#296341] mb-8">Ernest Dean | Founder</h3>
              <p className="text-[28px] text-black leading-relaxed mb-6">
                The late, Captain Ernest Alexander Dean was born on May 23, 1915, in the quaint settlement of Sandy Point, Abaco, Bahamas. As the eldest son of a fishing smack captain, Ernest's introduction to the sea came very early on in life. At the tender age of 9, he went to liv...
              </p>
              <button className="text-[28px] font-medium text-black hover:text-[#296341] transition-colors">
                Learn More....
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Tracking Section
function TrackingSection() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-[1088px] mx-auto space-y-12">
          <p className="text-[28px] font-light text-[#296341] leading-relaxed">
            At Dean's Shipping, we offer reliable boat and barge rental services designed to transport large-scale shipments across the islands and the Caribbean. Whether you're moving private shipments, large aggregates, cargo, or vehicle shipments, our fleet is equipped to handle it all.
          </p>

          <p className="text-[28px] font-light text-[#296341] leading-relaxed">
            We make tracking your parcels effortless. Our advanced real-time tracking system ensures you always know where your shipment is—from pickup to delivery. Whether it's local or global, small or oversized, our secure logistics network guarantees speed, reliability, and transparency. With 24/7 tracking updates, automated alerts, and dedicated customer support, we put you in control. Trust Shipping Cargo for seamless logistics, on-time deliveries, and peace of mind. Your cargo, our commitment—tracked, traced, and delivered.
          </p>
        </div>
      </div>
    </section>
  );
}

// Services Section
function ServicesSection() {
  return (
    <section className="py-24 px-8 bg-[#effaf6]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Services List */}
          <div className="space-y-8">
            <h2 className="text-[40px] font-semibold text-[#296341] mb-12">Our Services Include</h2>

            <div>
              <h3 className="text-[28px] font-semibold text-[#296341] mb-2">Private Shipments:</h3>
              <p className="text-[28px] text-[#296341] leading-relaxed">
                Safe and secure transportation of your private goods between islands and throughout the Caribbean.
              </p>
            </div>

            <div>
              <h3 className="text-[28px] font-semibold text-[#296341] mb-2">Large Aggregate Shipping:</h3>
              <p className="text-[28px] text-[#296341] leading-relaxed">
                We specialize in handling large cargo like construction materials, machinery, and more, ensuring safe delivery to your destination.
              </p>
            </div>

            <div>
              <h3 className="text-[28px] font-semibold text-[#296341] mb-2">Vehicle Shipments:</h3>
              <p className="text-[28px] text-[#296341] leading-relaxed">
                Transport your cars, trucks, and other vehicles with ease and reliability.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="bg-[#5f8a71] absolute inset-[-24px] rounded-lg" />
            <img alt="Shipping services" className="relative w-full h-[573px] object-cover rounded-lg shadow-lg" src={imgRectangle56.src} />
          </div>
        </div>
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

// Home Page
function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* <Header currentPage="home" onNavigate={onNavigate} /> */}
      <Hero />
      <AboutSection />
      <OperationsSection />
      <TeamSection />
      <TrackingSection />
      <ServicesSection />
      {/* <Footer /> */}
    </div>
  );
}

// Main App with Navigation
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return currentPage === 'schedule' ? <SchedulePage /> : <HomePage onNavigate={setCurrentPage} />;
}
