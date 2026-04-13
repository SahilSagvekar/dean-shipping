"use client";

import { SidebarProvider, Sidebar, HamburgerButton } from "@/components/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { BottomNav } from "@/components/BottomNav";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

function UserFooter() {
    const { user } = useAuth();
    const pathname = usePathname();
    // On dashboard page, user info is shown top-right inside the page itself
    const isDashboard = pathname === "/admin/dashboard";
    if (isDashboard || !user) return null;

    return (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 sm:px-6 lg:px-8 py-3 flex justify-end">
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] font-bold text-[#296341] uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-[#296341] flex items-center justify-center text-white font-black text-xs">
                    {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <SidebarProvider>
                <div className="bg-[#fcfdfd] h-screen flex flex-col lg:flex-row overflow-hidden">
                    {/* Sidebar: hidden on mobile until toggled, always visible on lg */}
                    <Sidebar />

                    {/* Content Wrapper */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                        {/* <BottomNav /> */}

                        {/* Mobile Header (hidden on lg) */}
                        <header className="lg:hidden px-4 h-16 sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <HamburgerButton iconSize={20} className="w-10 h-10" />
                                <div className="sm:hidden font-bold text-gray-900">
                                    Dean's <span className="text-[#296341]">Shipping</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 active:bg-gray-200 transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 active:bg-gray-200 transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                            </div>
                        </header>

                        {/* Desktop Header: persistent toggle */}
                        <header className="hidden lg:flex items-center h-16 px-8 bg-white border-b border-gray-100 flex-shrink-0">
                            <HamburgerButton iconSize={20} className="w-10 h-10 mr-4" />
                            
                            <div className="ml-auto flex items-center gap-4">
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Search className="w-5 h-5" /></button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Bell className="w-5 h-5" /></button>
                            </div>
                        </header>

                        {/* Main Content Area */}
                        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                {children}
                            </div>
                        </main>

                        {/* User name+role footer (all pages except dashboard) */}
                        <UserFooter />
                    </div>
                </div>
            </SidebarProvider>
        </AuthProvider>
    );
}