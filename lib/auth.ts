// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================
// JWT-based auth with Firebase phone verification

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "./prisma";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

// ============================================
// JWT TOKEN HELPERS
// ============================================

export interface JwtPayload {
    userId: string;
    role: Role;
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        throw new Error("Invalid or expired token");
    }
}

// ============================================
// REQUEST AUTHENTICATION
// ============================================

/**
 * Extract the JWT token from the Authorization header
 */
function extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

/**
 * Authenticate a request and return the user
 * Returns null if not authenticated
 */
export async function authenticateRequest(request: NextRequest) {
    const token = extractToken(request);
    if (!token) return null;

    try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true,
                mobileNumber: true,
                countryCode: true,
                agentCode: true,
                avatarUrl: true,
            },
        });

        if (!user || !user.isActive) return null;
        return user;
    } catch {
        return null;
    }
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof authenticateRequest>>>;

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(
    request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
    const user = await authenticateRequest(request);
    if (!user) {
        return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
        );
    }
    return { user };
}

/**
 * Require specific roles - returns 403 if not authorized
 */
export async function requireRole(
    request: NextRequest,
    allowedRoles: Role[]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    if (!allowedRoles.includes(result.user.role)) {
        return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 }
        );
    }
    return result;
}

/**
 * Require ADMIN role
 */
export async function requireAdmin(request: NextRequest) {
    return requireRole(request, ["ADMIN"]);
}

/**
 * Require ADMIN or AGENT role
 */
export async function requireStaff(request: NextRequest) {
    return requireRole(request, ["ADMIN", "AGENT"]);
}

// ============================================
// AUDIT LOG HELPER
// ============================================

export async function createAuditLog(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                metadata: params.metadata ?? undefined,
                ipAddress: params.ipAddress,
            },
        });
    } catch (error) {
        // Don't let audit log failures break the main flow
        console.error("Audit log error:", error);
    }
}

// ============================================
// UTILITY: Get IP from request
// ============================================

export function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}
