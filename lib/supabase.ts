// ============================================
// SUPABASE STORAGE UTILITY
// ============================================
// Handles file uploads to Supabase Storage

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to check if a key looks like a JWT (very basic check)
function isJWT(key: string) {
    if (!key) return false;
    const parts = key.split(".");
    return parts.length === 3;
}

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("CRITICAL: Supabase environment variables are missing.");
} else if (!isJWT(supabaseServiceKey)) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not a valid JWT (Invalid Compact JWS).");
}

// Use service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);


const BUCKET_NAME = "uploads";

/**
 * Upload a file to Supabase Storage
 * @param buffer - File buffer
 * @param path - Storage path (e.g., "cargo/booking123/image.jpg")
 * @param contentType - MIME type
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
    buffer: Buffer,
    path: string,
    contentType: string
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, {
            contentType,
            upsert: true,
        });

    if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param path - Storage path
 */
export async function deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        console.error("Supabase delete error:", error);
        throw new Error(`Delete failed: ${error.message}`);
    }
}

/**
 * Get a signed URL for temporary access
 * @param path - Storage path
 * @param expiresIn - Seconds until expiry (default 1 hour)
 */
export async function getSignedUrl(
    path: string,
    expiresIn: number = 3600
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

    if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
}

/**
 * List files in a directory
 * @param prefix - Directory path
 */
export async function listFiles(prefix: string) {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(prefix);

    if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
}

export { supabase };
