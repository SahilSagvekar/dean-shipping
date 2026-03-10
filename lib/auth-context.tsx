"use client";

// ============================================
// AUTH CONTEXT - Global authentication state
// ============================================
// Provides user info, token, login/logout helpers,
// and an apiFetch() wrapper that auto-attaches JWT.

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// ============================================
// TYPES
// ============================================

export type UserRole = "USER" | "AGENT" | "ADMIN";

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    countryCode: string;
    role: UserRole;
    agentCode?: string | null;
    avatarUrl?: string | null;
    designation?: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    /** fetch() wrapper that auto-attaches Authorization header */
    apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
    apiFetch: () => Promise.reject("AuthContext not initialised"),
});

export function useAuth() {
    return useContext(AuthContext);
}

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error("Failed to hydrate auth state:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login — store credentials & update state
    const login = useCallback((newToken: string, newUser: AuthUser) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    // Logout — clear everything & redirect to login
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        router.push("/login");
    }, [router]);

    // Authenticated fetch wrapper
    const apiFetch = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            const headers = new Headers(options.headers);

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            // Default to JSON content-type for non-FormData bodies
            if (options.body && !(options.body instanceof FormData)) {
                if (!headers.has("Content-Type")) {
                    headers.set("Content-Type", "application/json");
                }
            }

            const response = await fetch(url, { ...options, headers });

            // Auto-logout on 401
            if (response.status === 401) {
                logout();
            }

            return response;
        },
        [token, logout]
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                logout,
                apiFetch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
