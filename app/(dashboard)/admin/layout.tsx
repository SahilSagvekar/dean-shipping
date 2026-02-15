"use client";

// ============================================
// ADMIN LAYOUT — Role-based access guard
// ============================================
// Only users with role=ADMIN can view /admin/* pages.
// Non-admins see an "Admin Only" screen instead.

import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();

    // Show a loading spinner while auth state hydrates
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#296341] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#296341] text-lg font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in or not an admin → show access denied
    if (!isAuthenticated || user?.role !== "ADMIN") {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-md w-full text-center">
                    {/* Icon */}
                    <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-12 h-12 text-red-400" />
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Admin Access Only
                    </h1>

                    {/* Description */}
                    <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                        This page is restricted to administrators.
                        {!isAuthenticated
                            ? " Please log in with an admin account to continue."
                            : " Your current role does not have permission to view this page."}
                    </p>

                    {/* Current role badge */}
                    {isAuthenticated && user && (
                        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-8">
                            <ShieldCheck className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">
                                Your role: <span className="font-bold text-gray-800">{user.role}</span>
                            </span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!isAuthenticated && (
                            <a
                                href="/login"
                                className="inline-flex items-center justify-center px-6 py-3 bg-[#296341] text-white font-semibold rounded-lg hover:bg-[#1e4d30] transition-colors"
                            >
                                Go to Login
                            </a>
                        )}
                        <a
                            href="/cargo-booking"
                            className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#296341] text-[#296341] font-semibold rounded-lg hover:bg-[#296341]/5 transition-colors"
                        >
                            ← Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Authorized admin → render the page
    return <>{children}</>;
}
