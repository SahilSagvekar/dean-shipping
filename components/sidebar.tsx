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
} from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  const pathname = usePathname();
  useEffect(() => {
    setIsOpen(false);
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
    href: "/warehouse/manifest", // Updated to match manifest concept
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
    title: "Setting",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Cashier",
    href: "/cashier",
    icon: Settings,
  },
  {
    title: "Notifications",
    href: "/notification",
    icon: Settings,
  },
];

// ============================================
// SIDEBAR NAV ITEM
// ============================================

function SidebarNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-4 px-6 py-3 transition-colors group
        ${isActive ? "bg-[#e2f0ea]" : "hover:bg-[#e2f0ea]"}`}
    >
      <Icon className={`w-7 h-7 flex-shrink-0 transition-colors ${isActive ? "text-[#1a365d]" : "text-[#1a365d]/80 group-hover:text-[#1a365d]"}`} />
      <span className={`text-[17px] font-bold transition-colors ${isActive ? "text-[#1a365d]" : "text-[#1a365d]/80 group-hover:text-[#1a365d]"}`}>
        {item.title}
      </span>
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
  userName = "Cecily Dean",
  userRole = "Administration",
  logoSrc,
}: SidebarProps) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[320px] bg-[#f4fbf9] z-50 
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header - Hamburger box from image */}
        <div className="px-6 py-8">
          <button
            onClick={close}
            className="w-12 h-12 flex items-center justify-center border-2 border-[#1a73e8] rounded-sm bg-white hover:bg-gray-50 transition-colors"
            aria-label="Close menu"
          >
            <Menu className="w-8 h-8 text-[#1a365d]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-1">
          {navigationItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Optional: User/Logout (Hidden to match image strictly, but kept for partial visibility) */}
        {/* <div className="px-6 py-4 border-t border-[#e0e8e3] opacity-40 hover:opacity-100 transition-opacity">
          <button className="flex items-center gap-3 text-[#cf5d5d]">
            <LogOut className="w-5 h-5" />
            <span className="text-[15px] font-medium">Logout</span>
          </button>
        </div> */}
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
  iconSize = 28,
}: HamburgerButtonProps) {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      onClick={toggle}
      className={`w-12 h-12 flex items-center justify-center border-2 border-[#1a73e8] rounded-sm bg-white hover:bg-gray-50 transition-colors ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <Menu className="text-[#1a365d]" style={{ width: iconSize, height: iconSize }} />
    </button>
  );
}
