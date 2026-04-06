"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserCog,
  ShieldCheck,
  Ship,
  Banknote,
  Package,
  Ticket,
  Truck,
  FileText,
  Car,
  AlertTriangle,
  Settings,
  LogOut,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ============================================
// SIDEBAR CONTEXT - Share state across components
// ============================================

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => { },
  close: () => { },
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// ============================================
// SIDEBAR PROVIDER - Wrap your layout with this
// ============================================

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  // Close sidebar on route change (mobile)
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ============================================
// NAVIGATION CONFIG
// ============================================

export interface NavItem {
  title: string;
  href: string;
  icon: any;
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/user-management",
    icon: Users,
  },
  {
    title: "Agent Management",
    href: "/admin/agent-management",
    icon: UserCog,
  },
  {
    title: "Admin Management",
    href: "/admin/admin-management",
    icon: ShieldCheck,
  },
  {
    title: "Schedule Management",
    href: "/schedule-management",
    icon: Ship,
  },
  {
    title: "Price Management",
    href: "/price-management",
    icon: Banknote,
  },
  {
    title: "Location Management",
    href: "/location-management",
    icon: MapPin,
  },
  {
    title: "Freight Entry",
    href: "/cargo-booking",
    icon: Package,
  },
  {
    title: "Passenger Ticketing",
    href: "/passenger-booking",
    icon: Ticket,
  },
  {
    title: "Equipment Management",
    href: "/equipment-management",
    icon: Truck,
  },
  {
    title: "Manifest",
    href: "/manifest",
    icon: FileText,
  },
  {
    title: "Vehicle Wait List",
    href: "/vehicle-management",
    icon: Car,
  },
  {
    title: "Incident Report",
    href: "/incident-report",
    icon: AlertTriangle,
  },
  {
    title: "Cashier",
    href: "/cashier",
    icon: Banknote,
  },
  {
    title: "Notifications",
    href: "/notification",
    icon: AlertTriangle,
  },
];

// ============================================
// SIDEBAR NAV ITEM
// ============================================

function SidebarNavItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center justify-between gap-4 px-6 py-4 transition-all active:scale-[0.98]
        ${isActive ? "bg-blue-50/80 border-r-4 border-[#296341]" : "hover:bg-gray-50"}`}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive ? "text-[#296341]" : "text-gray-500"}`} />
        <span className={`text-[16px] font-semibold transition-colors ${isActive ? "text-[#296341]" : "text-gray-700"}`}>
          {item.title}
        </span>
      </div>
      {isActive && <ChevronRight className="w-4 h-4 text-[#296341]" />}
    </Link>
  );
}

// ============================================
// SIDEBAR COMPONENT - Reusable across all pages
// ============================================

interface SidebarProps {
  userName?: string;
  userRole?: string;
  logoSrc?: string;
}

export function Sidebar({
  userName: propUserName,
  userRole: propUserRole,
  logoSrc,
}: SidebarProps) {
  const { isOpen, close } = useSidebar();
  const { user, logout } = useAuth();

  // If user is available, use their data; otherwise fallback to props or defaults
  const displayName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : (propUserName || "Cecily Dean");
    
  const displayRole = user 
    ? (user.designation || user.role || "Administration") 
    : (propUserRole || "Administration");

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : "CD";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full bg-white z-50 
          flex flex-col shadow-2xl lg:shadow-none border-r border-gray-100
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen 
            ? "w-[300px] sm:w-[320px] translate-x-0" 
            : "-translate-x-full lg:translate-x-0 lg:w-[0px] lg:opacity-0 lg:pointer-events-none"}`}
      >
        {/* Header with Title and Close */}
        <div className="px-6 py-8 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#296341] rounded-lg flex items-center justify-center">
                <Ship className="text-white w-6 h-6" />
             </div>
             <div className="font-bold text-xl text-gray-900 leading-tight">
                Dean's<br/><span className="text-[#296341]">Shipping</span>
             </div>
          </div>
          <button
            onClick={close}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 active:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5">
          {navigationItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} onClick={close} />
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#296341] font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{displayRole}</p>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-white active:scale-90"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================
// HAMBURGER BUTTON - Use anywhere to trigger sidebar
// ============================================

interface HamburgerButtonProps {
  className?: string;
  iconSize?: number;
}

export function HamburgerButton({
  className = "",
  iconSize = 24,
}: HamburgerButtonProps) {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      onClick={toggle}
      className={`w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm active:scale-95 transition-all ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X className="text-gray-900" style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Menu className="text-gray-900" style={{ width: iconSize, height: iconSize }} />
      )}
    </button>
  );
}
