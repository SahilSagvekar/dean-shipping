"use client";

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import imgRectangle1 from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import { useRouter } from 'next/navigation';

export function Header({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Schedule', path: '/schedule' },
    { label: 'About Us', path: '/about' },
    { label: 'Your Shipment', path: '/shipment' },
    { label: 'Pay Now', path: '/paynow' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 md:py-5 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="w-[200px] md:w-[339px] h-12 md:h-24 cursor-pointer" 
          onClick={() => {
            router.push('/');
            setIsMenuOpen(false);
          }}
        >
          <img alt="Dean's Shipping Ltd." className="w-full h-full object-cover" src={imgRectangle1.src} />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navLinks.map((link) => (
            <div key={link.path} className="relative">
              <button 
                onClick={() => router.push(link.path)} 
                className={`text-lg xl:text-xl transition-colors cursor-pointer ${
                  currentPage === link.path.replace('/', '') ? 'text-[#296341] font-bold' : 'text-black hover:text-[#296341]'
                }`}
              >
                {link.label}
              </button>
              {currentPage === link.path.replace('/', '') && (
                <div className="absolute left-0 right-0 h-[3px] bg-[#296341] rounded-full mt-1" />
              )}
            </div>
          ))}
          <button 
            onClick={() => router.push('/login')} 
            className="bg-[#296341] border border-[#296341] text-white px-6 xl:px-8 py-2 md:py-3 rounded-[10px] text-lg xl:text-xl font-bold hover:bg-[#1e4a2f] transition-colors cursor-pointer"
          >
            LOGIN
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="lg:hidden p-2 text-[#296341]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 top-[72px] md:top-[120px] bg-white z-40 transition-transform duration-300 transform lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex flex-col p-6 gap-6 h-full overflow-y-auto">
          {navLinks.map((link) => (
            <button 
              key={link.path}
              onClick={() => {
                router.push(link.path);
                setIsMenuOpen(false);
              }}
              className={`text-2xl text-left py-2 border-b border-gray-100 ${
                currentPage === link.path.replace('/', '') ? 'text-[#296341] font-bold' : 'text-black'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => {
              router.push('/login');
              setIsMenuOpen(false);
            }} 
            className="bg-[#296341] text-white py-4 rounded-xl text-2xl font-bold mt-4"
          >
            LOGIN
          </button>
        </nav>
      </div>
    </header>
  );
}
