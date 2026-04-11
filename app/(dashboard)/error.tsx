"use client";

import { useEffect } from "react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error boundary caught:", error);
    }, [error]);

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-lg">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                    <svg
                        className="w-8 h-8 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    This section ran into a problem
                </h2>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                    The rest of the dashboard is still working. You can try reloading
                    this section or navigate to another page.
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-[#296341] text-white rounded-lg font-bold text-sm hover:bg-emerald-800 transition-colors shadow-sm active:scale-95"
                    >
                        Reload Section
                    </button>
                    <button
                        onClick={() => (window.location.href = "/dashboard")}
                        className="px-5 py-2.5 bg-white text-gray-600 rounded-lg font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>

                {error.digest && (
                    <p className="mt-4 text-xs text-gray-400">
                        Reference: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
