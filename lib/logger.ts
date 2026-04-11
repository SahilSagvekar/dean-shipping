// ============================================
// STRUCTURED LOGGER
// ============================================
// Provides structured logging for production and development.
// Replace console.log/error across the codebase with this logger.

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
    [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
    return JSON.stringify({
        level,
        msg: message,
        ts: new Date().toISOString(),
        ...meta,
    });
}

export const logger = {
    /**
     * Info-level log. Shown in development, suppressed in production
     * unless explicitly needed for audit trail.
     */
    info: (message: string, meta?: LogMeta) => {
        if (process.env.NODE_ENV === "production") {
            // In production, only emit structured JSON for log aggregation
            console.info(formatLog("info", message, meta));
        } else {
            console.info(`[INFO] ${message}`, meta || "");
        }
    },

    /**
     * Warning-level log. Always shown.
     */
    warn: (message: string, meta?: LogMeta) => {
        if (process.env.NODE_ENV === "production") {
            console.warn(formatLog("warn", message, meta));
        } else {
            console.warn(`[WARN] ${message}`, meta || "");
        }
    },

    /**
     * Error-level log. Always shown. Never include raw error objects
     * in responses — only log them server-side.
     */
    error: (message: string, error?: unknown, meta?: LogMeta) => {
        const errorInfo: LogMeta = {};
        if (error instanceof Error) {
            errorInfo.errorName = error.name;
            errorInfo.errorMessage = error.message;
            if (process.env.NODE_ENV !== "production") {
                errorInfo.stack = error.stack;
            }
        } else if (error) {
            errorInfo.errorRaw = String(error);
        }

        if (process.env.NODE_ENV === "production") {
            console.error(formatLog("error", message, { ...errorInfo, ...meta }));
        } else {
            console.error(`[ERROR] ${message}`, error, meta || "");
        }
    },

    /**
     * Debug-level log. Only shown in development.
     */
    debug: (message: string, meta?: LogMeta) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(`[DEBUG] ${message}`, meta || "");
        }
    },
};

export default logger;
