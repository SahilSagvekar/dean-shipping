"use client";

import { SidebarProvider, Sidebar, HamburgerButton } from "@/components/sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { BottomNav } from "@/components/BottomNav";
import { Bell, Search } from "lucide-react";

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
                                <HamburgerButton iconSize={20} className="w-10 h-10 rounded-xl" />
                                <div className="sm:hidden font-bold text-gray-900">
                                    Dean's <span className="text-[#296341]">Shipping</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 active:bg-gray-200 transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 active:bg-gray-200 transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                            </div>
                        </header>

                        {/* Desktop Header: persistent toggle */}
                        <header className="hidden lg:flex items-center h-16 px-8 bg-white border-b border-gray-100 flex-shrink-0">
                            <HamburgerButton iconSize={20} className="w-10 h-10 rounded-xl mr-4" />
                            {/* <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                                Dashboard
                                <span className="ml-2 text-xs font-normal text-gray-400 normal-case tracking-normal">Administration</span>
                            </h1> */}
                            
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
                    </div>
                </div>
            </SidebarProvider>
        </AuthProvider>
    );
}
