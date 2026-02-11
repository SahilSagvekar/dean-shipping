// ============================================
// POST /api/upload - Upload files to Supabase Storage
// ============================================
// Handles image uploads for cargo, passenger bookings, and ID documents

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadFile } from "@/lib/supabase";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const bookingType = formData.get("bookingType") as string; // "cargo" or "passenger"
        const bookingId = formData.get("bookingId") as string;
        const imageType = formData.get("imageType") as string; // "cargo", "id_document", "deficiency"

        if (!file || !bookingId || !imageType) {
            return NextResponse.json(
                { error: "Missing required fields: file, bookingId, imageType" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC, PDF" },
                { status: 400 }
            );
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File too large. Maximum 10MB." },
                { status: 400 }
            );
        }

        // Generate storage path
        const ext = file.name.split(".").pop() || "jpg";
        const timestamp = Date.now();
        const path = `${bookingType || "general"}/${bookingId}/${imageType}-${timestamp}.${ext}`;

        // Upload to Supabase Storage
        const buffer = Buffer.from(await file.arrayBuffer());
        const publicUrl = await uploadFile(buffer, path, file.type);

        // Save reference in database
        const imageData: any = {
            imageUrl: publicUrl,
            imageType,
        };

        if (bookingType === "cargo") {
            imageData.cargoBookingId = bookingId;
        } else if (bookingType === "passenger") {
            imageData.passengerBookingId = bookingId;
        }

        const bookingImage = await prisma.bookingImage.create({
            data: imageData,
        });

        return NextResponse.json(
            {
                image: bookingImage,
                url: publicUrl,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error.message || "Upload failed" },
            { status: 500 }
        );
    }
}
