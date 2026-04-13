// ============================================
// RETRY UTILITY - Exponential Backoff
// ============================================
// Use for external service calls (email, Cloudinary, Stripe, etc.)
// to handle transient failures gracefully.

interface RetryOptions {
    /** Maximum number of attempts (including the first). Default: 3 */
    maxAttempts?: number;
    /** Initial delay in ms before first retry. Default: 500 */
    initialDelayMs?: number;
    /** Multiplier for each subsequent delay. Default: 2 */
    backoffMultiplier?: number;
    /** Maximum delay in ms (cap). Default: 10000 */
    maxDelayMs?: number;
    /** Optional predicate: return true if the error is retryable. Default: all errors are retryable. */
    isRetryable?: (error: unknown) => boolean;
    /** Called on each retry with attempt number and error. */
    onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelayMs: 500,
    backoffMultiplier: 2,
    maxDelayMs: 10_000,
    isRetryable: () => true,
    onRetry: () => {},
};

/**
 * Execute an async function with retry logic and exponential backoff.
 *
 * @example
 * const result = await retry(() => sendEmail({ to, subject, html }), {
 *   maxAttempts: 3,
 *   onRetry: (attempt, err) => console.warn(`Email retry #${attempt}:`, err),
 * });
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: unknown;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // If this was the last attempt, or the error isn't retryable, throw immediately
            if (attempt >= opts.maxAttempts || !opts.isRetryable(error)) {
                throw error;
            }

            // Calculate delay with exponential backoff + jitter
            const baseDelay = opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1);
            const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
            const delay = Math.min(baseDelay + jitter, opts.maxDelayMs);

            opts.onRetry(attempt, error);

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // TypeScript safety - should never reach here
    throw lastError;
}

/**
 * Common retryable error checkers for different services.
 */
export const retryableChecks = {
    /** Network errors, timeouts, 5xx responses */
    network: (error: unknown): boolean => {
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            return (
                msg.includes("network") ||
                msg.includes("timeout") ||
                msg.includes("econnreset") ||
                msg.includes("econnrefused") ||
                msg.includes("socket hang up") ||
                msg.includes("fetch failed") ||
                msg.includes("503") ||
                msg.includes("502") ||
                msg.includes("429")
            );
        }
        return false;
    },

    /** Stripe-specific retryable errors */
    stripe: (error: unknown): boolean => {
        if (error && typeof error === "object" && "type" in error) {
            const stripeError = error as { type: string; statusCode?: number };
            return (
                stripeError.type === "StripeConnectionError" ||
                stripeError.type === "StripeAPIError" ||
                (stripeError.statusCode !== undefined && stripeError.statusCode >= 500) ||
                stripeError.statusCode === 429
            );
        }
        return retryableChecks.network(error);
    },

    /** SMTP/email retryable errors */
    email: (error: unknown): boolean => {
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            return (
                msg.includes("connection") ||
                msg.includes("timeout") ||
                msg.includes("socket") ||
                msg.includes("temporary") ||
                msg.includes("try again") ||
                msg.includes("421") || // Service not available
                msg.includes("450") || // Mailbox unavailable (temporary)
                msg.includes("451") // Local error in processing
            );
        }
        return false;
    },

    /** Cloudinary retryable errors */
    cloudinary: (error: unknown): boolean => {
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            return (
                msg.includes("timeout") ||
                msg.includes("network") ||
                msg.includes("rate limit") ||
                msg.includes("server error") ||
                msg.includes("503") ||
                msg.includes("429")
            );
        }
        return false;
    },
};

export default retry;