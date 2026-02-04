"use client";

import { SidebarProvider, Sidebar, HamburgerButton } from "@/components/sidebar";
import imgLogo from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="bg-white min-h-screen flex flex-col">
                <Sidebar logoSrc={imgLogo.src} />

                {/* Shared Header for all dashboard pages */}
                <div className="px-4 sm:px-8 py-4 fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-30">
                    <HamburgerButton iconSize={32} />
                </div>

                <div className="flex-1 pt-[80px] sm:pt-[100px]">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    );
}
