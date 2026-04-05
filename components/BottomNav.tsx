"use client";

import { Home, Package, FileText, Calendar, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: 'Home', path: '/admin/dashboard' },
    { icon: Package, label: 'Bookings', path: '/cargo-booking' },
    { icon: FileText, label: 'Manifest', path: '/manifest' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-2 flex items-center justify-around lg:hidden pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all ${
              isActive ? 'text-[#296341]' : 'text-gray-400'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 shadow-sm' : ''}`} />
            <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute top-0 w-8 h-1 bg-[#296341] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
