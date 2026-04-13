// ============================================
// CLOUDINARY STORAGE UTILITY
// ============================================
// Handles file uploads to Cloudinary

import { v2 as cloudinary } from "cloudinary";
import { retry, retryableChecks } from "./retry";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error("CRITICAL: Cloudinary environment variables are missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});


/**
 * Upload a file to Cloudinary
 * @param buffer - File buffer
 * @param path - Desired path (e.g., "cargo/booking123/image-123.jpg")
 * @returns Secure URL of the uploaded file
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    path: string
): Promise<string> {
    const pathParts = path.split("/");
    const filenameWithExt = pathParts.pop() || "image";
    const folder = pathParts.join("/");
    const publicId = filenameWithExt.split(".")[0];

    return retry(
        () =>
            new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: folder || "general",
                        public_id: publicId,
                        resource_type: "auto",
                        timeout: 30_000,
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                        }
                        resolve(result!.secure_url);
                    }
                );
                uploadStream.end(buffer);
            }),
        {
            maxAttempts: 3,
            initialDelayMs: 1_000,
            isRetryable: retryableChecks.cloudinary,
            onRetry: (attempt, err) => {
                console.warn(`[Cloudinary] Retry #${attempt}:`, (err as Error).message);
            },
        }
    );
}

/**
 * Delete a file from Cloudinary 
 * Note: Cloudinary expects the public_id, not the full URL.
 * @param publicId - The public_id of the image (e.g., "cargo/booking123/image-123")
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    const { result, error } = await cloudinary.uploader.destroy(publicId);

    if (error || result !== "ok") {
        console.error("Cloudinary delete error:", error || result);
        throw new Error(`Cloudinary delete failed: ${error?.message || result}`);
    }
}

export { cloudinary };