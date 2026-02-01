"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  Box,
  Printer,
  LayoutDashboard,
  Users,
  UserCog,
  UserCheck,
  Ship,
  Calendar,
  Anchor,
  CreditCard,
  Boxes,
  ClipboardList,
  AlertTriangle,
  Wallet,
  Bell,
  MapPin,
  BarChart3,
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
  toggle: () => {},
  close: () => {},
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
  roles?: string[];
  children?: { title: string; href: string }[];
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Shipments",
    href: "/shipments",
    icon: Package,
    children: [
      { title: "All Shipments", href: "/shipments" },
      { title: "New Booking", href: "/shipments/new" },
    ],
  },
  {
    title: "Voyages",
    href: "/voyages",
    icon: Anchor,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Schedules",
    href: "/schedules",
    icon: Calendar,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
    children: [
      { title: "All Invoices", href: "/invoices" },
      { title: "Unpaid", href: "/invoices/unpaid" },
    ],
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Cashier",
    href: "/cashier",
    icon: Wallet,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Manifest",
    href: "/manifest",
    icon: ClipboardList,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Ships",
    href: "/ships",
    icon: Ship,
    roles: ["ADMIN"],
  },
  {
    title: "Locations",
    href: "/locations",
    icon: MapPin,
    roles: ["ADMIN"],
  },
  {
    title: "Prices",
    href: "/prices",
    icon: DollarSign,
    roles: ["ADMIN"],
  },
  {
    title: "Equipment",
    href: "/equipment",
    icon: Boxes,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Incidents",
    href: "/incidents",
    icon: AlertTriangle,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN", "AGENT"],
  },
  {
    title: "Agents",
    href: "/agents",
    icon: UserCheck,
    roles: ["ADMIN"],
  },
  {
    title: "Admins",
    href: "/admins",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["ADMIN"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// ============================================
// SIDEBAR NAV ITEM
// ============================================

function SidebarNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const isActive =
    pathname === item.href ||
    (item.children?.some((child) => pathname === child.href) ?? false);

  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
            ${isActive ? "bg-[#296341] text-white" : "text-[#1a1a1a] hover:bg-[#e8f0eb]"}`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-[15px] font-medium">{item.title}</span>
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-200 ${expanded ? "max-h-40" : "max-h-0"}`}
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block pl-12 pr-4 py-2.5 text-[14px] rounded-lg transition-colors
                ${pathname === child.href ? "text-[#296341] font-semibold bg-[#e8f0eb]" : "text-[#555] hover:text-[#296341] hover:bg-[#f0f5f2]"}`}
            >
              {child.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive ? "bg-[#296341] text-white" : "text-[#1a1a1a] hover:bg-[#e8f0eb]"}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-[15px] font-medium">{item.title}</span>
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
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#e0e8e3]">
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" className="h-10" />
          ) : (
            <span className="text-[18px] font-bold text-[#296341]">
              Dean&apos;s Shipping
            </span>
          )}
          <button
            onClick={close}
            className="p-2 rounded-lg hover:bg-[#e8f0eb] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-[#296341]" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-[#e0e8e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#296341] flex items-center justify-center text-white font-bold text-[14px]">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1a1a1a]">
                {userName}
              </p>
              <p className="text-[12px] text-[#666]">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#e0e8e3]">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#cf5d5d] hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-[15px] font-medium">Logout</span>
          </button>
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
  iconSize = 28,
}: HamburgerButtonProps) {
  const { toggle, isOpen } = useSidebar();

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-lg hover:bg-[#e8f0eb] transition-colors ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <Menu className={`text-[#296341]`} style={{ width: iconSize, height: iconSize }} />
    </button>
  );
}