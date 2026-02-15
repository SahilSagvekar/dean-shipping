"use client";

// ============================================
// APP PROVIDERS
// ============================================
// Wraps the app with all necessary context providers

import { AuthProvider } from "@/context/AuthContext";

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}

export default Providers;
