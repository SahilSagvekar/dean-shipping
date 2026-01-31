"use client";

import { Ship } from 'lucide-react';
import { useState } from 'react';
import svgPaths from "@/app/imports/svg-1kz55w3e74";
import imgRectangle4 from "@/assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgEllipse10 from "@/assets/bf9cd628ad5f00dd322c5f93f026d17b58691ba9.png";
import imgEllipse11 from "@/assets/346182195ff46a2a07dc2451f19eb7228d7596a1.png";
import imgRectangle44 from "@/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle56 from "@/assets/c65da6ab6f4bda8a2bd7648a2be4287c1ac755df.png";
import imgRectangle1 from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import { useRouter } from 'next/navigation';
// import SchedulePage from './components/SchedulePage';

export function Header({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const router = useRouter();
  return (
    
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      
      <div className="max-w-[1440px] mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="w-[339px] h-24 cursor-pointer" onClick={() => router.push('/')}>
          <img alt="Dean's Shipping Ltd." className="w-full h-full object-cover" src={imgRectangle1.src} />
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center gap-12">
          {/* const router = useRouter(); */}
          <div className="relative">
            <button  onClick={() => router.push('/schedule')} className="text-xl text-black hover:text-[#296341] transition-colors">
              Schedule
            </button>
            {currentPage === 'schedule' && (
              <div className="absolute left-0 right-0 h-[3px] bg-[#296341] rounded-full mt-1" />
            )}
          </div>
          <div className="relative">
            <button onClick={() => router.push('/about')}  className="text-xl text-black hover:text-[#296341] transition-colors">
              About Us
            </button>
            {/* {currentPage === 'home' && (
              <div className="absolute left-0 right-0 h-[3px] bg-[#296341] rounded-full mt-1" />
            )} */}
          </div>
          <button onClick={() => router.push('/shipment')} className="text-xl text-black hover:text-[#296341] transition-colors">
            Your Shipment
          </button>
          <button onClick={() => router.push('/pay-now')} className="text-xl text-black hover:text-[#296341] transition-colors">
            Pay Now
          </button>
          <button onClick={() => router.push('/contact')} className="text-xl text-black hover:text-[#296341] transition-colors">
            Contact Us
          </button>
          <button onClick={() => router.push('/login')} className="bg-[#296341] border border-[#296341] text-white px-8 py-3 rounded-[10px] text-xl font-bold hover:bg-[#1e4a2f] transition-colors">
            LOGIN
          </button>
        </nav>
      </div>
    </header>
  );
}