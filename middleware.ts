// ============================================
// MIDDLEWARE - Rate Limiting for Auth Routes
// ============================================
// Protects authentication endpoints from brute-force attacks
// Uses in-memory rate limiting (resets on cold start, which is fine for Vercel)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
const rateLimitStore = new Map<
    string,
    { count: number; resetTime: number }
>();

// Clean up stale entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupStaleEntries() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

function checkRateLimit(
    ip: string,
    maxAttempts: number,
    windowMs: number
): { allowed: boolean; remaining: number } {
    cleanupStaleEntries();

    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (entry.count >= maxAttempts) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: maxAttempts - entry.count };
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rate limit auth endpoints
    if (
        pathname.startsWith("/api/auth/login") ||
        pathname.startsWith("/api/auth/register")
    ) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";

        const { allowed, remaining } = checkRateLimit(
            `auth:${ip}`,
            15,            // 15 attempts
            15 * 60 * 1000 // per 15-minute window
        );

        if (!allowed) {
            return NextResponse.json(
                { error: "Too many login attempts. Please try again in 15 minutes." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "900",
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        // Add rate limit headers to the response
        const response = NextResponse.next();
        response.headers.set("X-RateLimit-Remaining", String(remaining));
        return response;
    }

    // Rate limit upload endpoint (more generous)
    if (pathname.startsWith("/api/upload")) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";

        const { allowed } = checkRateLimit(
            `upload:${ip}`,
            60,             // 60 uploads
            10 * 60 * 1000  // per 10-minute window
        );

        if (!allowed) {
            return NextResponse.json(
                { error: "Upload rate limit exceeded. Please try again later." },
                { status: 429, headers: { "Retry-After": "600" } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/auth/:path*", "/api/upload/:path*"],
};
