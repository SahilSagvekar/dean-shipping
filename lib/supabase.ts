// ============================================
// SUPABASE CLIENT
// ============================================
// Admin client for server-side operations (Storage, etc.)
// Supabase is used for: PostgreSQL (via Prisma), Storage (images/docs)

import { createClient } from "@supabase/supabase-js";

// Server-side admin client (uses service_role key)
// Use this for: file uploads, storage operations, admin tasks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin client - full access, use only server-side
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Public client - limited access, can be used client-side
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// STORAGE HELPERS
// ============================================

const BUCKET_NAME = "dean-shipping";

/**
 * Upload a file to Supabase Storage
 * @param file - The file buffer to upload
 * @param path - The storage path (e.g., "cargo-images/booking-id/photo.jpg")
 * @param contentType - MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
    file: Buffer,
    path: string,
    contentType: string
): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            contentType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const {
        data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

/**
 * Get a signed URL for temporary access
 */
export async function getSignedUrl(
    path: string,
    expiresIn: number = 3600
): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

    if (error) {
        throw new Error(`Signed URL failed: ${error.message}`);
    }

    return data.signedUrl;
}
