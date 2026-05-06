// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================
// JWT-based auth with Firebase phone verification



import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";


// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

import { z } from "zod";

const email = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be under 255 characters");

const mobileNumber = z
    .string()
    .min(1, "Mobile number is required")
    .max(20, "Mobile number too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid mobile number format");

const name = z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters")
    .trim();

export const loginSchema = z.object({
    firebaseIdToken: z.string().optional(),
    loginType: z.enum(["user", "agent", "admin", "USER", "AGENT", "ADMIN"]).optional(),
    mobileNumber: z.string().max(20).optional(),
    password: z.string().max(200).optional(),
});

export const registerSchema = z.object({
    firebaseIdToken: z.string().min(1, "Firebase token is required"),
    firstName: name,
    lastName: name,
    email,
    countryCode: z
        .string()
        .max(5, "Country code too long")
        .regex(/^\+\d{1,4}$/, "Invalid country code")
        .optional()
        .default("+1"),
    mobileNumber,
});

export const createUserSchema = z.object({
    name: z.string().max(200).optional(),
    firstName: z.string().max(100).trim().optional(),
    lastName: z.string().max(100).trim().optional(),
    email,
    countryCode: z.string().max(5).optional().default("+1"),
    mobileNumber,
    role: z.enum(["USER", "AGENT", "ADMIN"]).optional().default("USER"),
    agentCode: z.string().max(20).optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(200).optional(),
    designation: z.string().max(100).optional(),
}).refine(
    (data) => data.firstName || data.name,
    { message: "Either firstName or name is required", path: ["firstName"] }
);

export const updateUserSchema = z.object({
    firstName: z.string().max(100).trim().optional(),
    lastName: z.string().max(100).trim().optional(),
    email: z.string().email().max(255).optional(),
    avatarUrl: z.string().url().max(500).optional().nullable(),
    role: z.enum(["USER", "AGENT", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
    agentCode: z.string().max(20).optional(),
    mobileNumber: z.string().max(20).optional(),
    countryCode: z.string().max(5).optional(),
    password: z.string().min(8).max(200).optional(),
});

// Define Role type locally to avoid Prisma client generation issues on build
type Role = "USER" | "AGENT" | "ADMIN" | "SENIOR_MANAGER" | "FREIGHT_SUPERVISOR" | "FREIGHT_AGENT" | "DOCK_MANAGER" | "CASHIER_TICKETING_AGENT" | "ACCOUNTS";


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

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
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

    if (!allowedRoles.includes(result.user.role as Role)) {
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
    return requireRole(request, ["ADMIN", "AGENT", "SENIOR_MANAGER", "FREIGHT_SUPERVISOR", "FREIGHT_AGENT", "DOCK_MANAGER", "CASHIER_TICKETING_AGENT", "ACCOUNTS"]);
}

// ============================================
// AUDIT LOG HELPER
// ============================================

export async function createAuditLog(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
    ipAddress?: string;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                metadata: params.metadata,
                oldValue: params.oldValue,
                newValue: params.newValue,
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
