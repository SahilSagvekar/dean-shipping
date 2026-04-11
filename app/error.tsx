"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to external error tracking (Sentry, etc.)
        console.error("Global error boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Something went wrong
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    An unexpected error occurred. Don&apos;t worry — your data is safe.
                    Please try again or refresh the page.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-[#296341] text-white rounded-xl font-bold hover:bg-emerald-800 transition-colors shadow-md active:scale-95"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-white text-gray-700 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>

                {/* Error digest for support */}
                {error.digest && (
                    <p className="mt-6 text-xs text-gray-400">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
