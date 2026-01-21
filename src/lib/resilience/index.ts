import { ResilienceConfig, RateLimitTracker, RateLimitInfo } from "../types/interfaces";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class RateLimitManager {
    private static instance: RateLimitManager;
    private tracker: RateLimitTracker = {};

    static getInstance(): RateLimitManager {
        if (!RateLimitManager.instance) RateLimitManager.instance = new RateLimitManager();
        return RateLimitManager.instance;
    };

    /**
     * Parses a header value that could be a number or "unlimited".
     * Returns undefined if the value is "unlimited", null, undefined, or invalid.
     */
    private parseHeaderValue(value: unknown): number | undefined {
        // Handle non-string types (arrays, objects, null, undefined)
        if (value === null || value === undefined) return undefined;
        if (typeof value !== "string" && typeof value !== "number") return undefined;

        const strValue = String(value).trim().toLowerCase();
        if (!strValue || strValue === "unlimited") return undefined;

        const parsed = parseInt(strValue, 10);
        // Return undefined for NaN or negative values (rate limits can't be negative)
        return (isNaN(parsed) || parsed < 0) ? undefined : parsed;
    };

    updateRateLimit(clientId: string, headers: any): void {
        if (!this.tracker[clientId]) this.tracker[clientId] = {};

        const limitInfo = this.tracker[clientId];

        // Handle headers that may be "unlimited" or missing
        const limitRequests = headers["x-ratelimit-limit-requests"];
        const remainingRequests = headers["x-ratelimit-remaining-requests"];
        const resetRequests = headers["x-ratelimit-reset-requests"];
        const retryAfter = headers["retry-after"];

        // Only update numeric values if they are valid numbers (not "unlimited")
        const parsedLimit = this.parseHeaderValue(limitRequests);
        const parsedRemaining = this.parseHeaderValue(remainingRequests);
        const parsedRetryAfter = this.parseHeaderValue(retryAfter);

        if (parsedLimit !== undefined) limitInfo.limit = parsedLimit;
        if (parsedRemaining !== undefined) limitInfo.remaining = parsedRemaining;
        // Mark as unlimited if header explicitly says "unlimited"
        if (typeof remainingRequests === "string" && remainingRequests.trim().toLowerCase() === "unlimited") limitInfo.isUnlimited = true;
        if (resetRequests && typeof resetRequests === "string") limitInfo.resetTime = resetRequests;
        if (parsedRetryAfter !== undefined) limitInfo.retryAfter = parsedRetryAfter;

        limitInfo.lastUpdated = Date.now();
    };

    isRateLimited(clientId: string): boolean {
        const limitInfo = this.tracker[clientId];
        if (!limitInfo) return false;
        // If marked as unlimited, never rate limited
        if (limitInfo.isUnlimited) return false;
        // Only consider rate limited if remaining is explicitly set and is 0 or less
        return limitInfo.remaining !== undefined && limitInfo.remaining <= 0;
    };

    getRetryAfter(clientId: string): number | undefined {
        return this.tracker[clientId]?.retryAfter;
    };

    clearExpiredLimits(): void {
        const now = Date.now();
        Object.keys(this.tracker).forEach(clientId => {
            const limitInfo = this.tracker[clientId];
            if (limitInfo.lastUpdated && (now - limitInfo.lastUpdated) > 300000) delete this.tracker[clientId];
        });
    };
};

export class ResilienceManager {
    private config: Required<ResilienceConfig>;
    private clientId: string;
    private rateLimitManager: RateLimitManager;

    constructor(config: ResilienceConfig = {}, clientId: string = "default") {
        this.config = {
            fallbackEnabled: config.fallbackEnabled ?? false,
            retryAttempts: Math.max(0, config.retryAttempts ?? 2), // Number of additional retries
            retryDelay: Math.max(0, config.retryDelay ?? 1000)
        };
        this.clientId = clientId;
        this.rateLimitManager = RateLimitManager.getInstance();
    };

    async executeWithResilience<T>(
        axiosClient: AxiosInstance,
        requestConfig: AxiosRequestConfig,
        fallbackData?: T
    ): Promise<T> {
        let lastError: Error;
        const totalAttempts = 1 + this.config.retryAttempts; // 1 normal + N retries

        // Clean up expired rate limits periodically
        this.rateLimitManager.clearExpiredLimits();

        // Check if client is currently rate limited
        if (this.rateLimitManager.isRateLimited(this.clientId)) {
            const retryAfter = this.rateLimitManager.getRetryAfter(this.clientId);
            if (retryAfter) {
                console.warn(`[Dymo API] Client ${this.clientId} is rate limited. Waiting ${retryAfter} seconds...`);
                await this.sleep(retryAfter * 1000);
            }
        }

        for (let attempt = 1; attempt <= totalAttempts; attempt++) {
            try {
                const response = await axiosClient.request(requestConfig);
                
                // Update rate limit tracking
                this.rateLimitManager.updateRateLimit(this.clientId, response.headers);

                // Check for rate limiting
                if (response.status === 429) {
                    const retryAfter = this.rateLimitManager.getRetryAfter(this.clientId);
                    if (retryAfter) {
                        console.warn(`[Dymo API] Rate limited. Waiting ${retryAfter} seconds (no retries)`);
                        await this.sleep(retryAfter * 1000);
                    }
                    throw new Error(`Rate limited (429) - not retrying`);
                }

                return response.data;
            } catch (error: any) {
                lastError = error;
                
                let shouldRetry = this.shouldRetry(error);
                const isLastAttempt = attempt === totalAttempts;

                // Don't retry on rate limiting (429)
                if (error.response?.status === 429) shouldRetry = false;

                if (!shouldRetry || isLastAttempt) {
                    if (this.config.fallbackEnabled && fallbackData) {
                        console.warn(`[Dymo API] Request failed after ${attempt} attempts. Using fallback data.`);
                        return fallbackData;
                    }
                    throw error;
                }

                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                console.warn(`[Dymo API] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await this.sleep(delay);
            }
        }

        throw lastError!;
    };

    private shouldRetry(error: any): boolean {
        const statusCode = error.response?.status;
        const isNetworkError = !error.response && error.code !== "ECONNABORTED";
        const isServerError = statusCode && statusCode >= 500;

        // Retry on: network errors, server errors (5xx)
        // DON'T retry on: rate limiting (429) - handled separately
        // DON'T retry on: client errors (4xx except 429)
        return isNetworkError || isServerError;
    };

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    getConfig(): Required<ResilienceConfig> {
        return { ...this.config };
    };

    getClientId(): string {
        return this.clientId;
    };
};