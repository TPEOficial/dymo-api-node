import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface IsValidPwdParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    data: Interfaces.IsValidPwdData;
}

/**
 * Validates a password based on the given parameters.
 */
export const isValidPwd = async ({
    axiosClient,
    resilienceManager,
    data
}: IsValidPwdParams): Promise<Interfaces.PasswordValidationResult> => {
    let { email, password, bannedWords, min, max } = data;
    if (password === undefined) throw customError(1000, "You must specify at least the password.");
    const params: { [key: string]: any; } = { password: encodeURIComponent(password) };

    if (email) {
        if (!/^[a-zA-Z0-9._\-+]+@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) throw customError(1500, "If you provide an email address it must be valid.");
        params.email = encodeURIComponent(email);
    }

    if (bannedWords) {
        if (typeof bannedWords === "string") bannedWords = bannedWords.slice(1, -1).trim().split(",").map(item => item.trim());
        if (!Array.isArray(bannedWords) || bannedWords.length > 10) throw customError(1500, "If you provide a list of banned words; the list may not exceed 10 words and must be of array type.");
        if (!bannedWords.every(word => typeof word === "string") || new Set(bannedWords).size !== bannedWords.length) throw customError(1500, "If you provide a list of banned words; all elements must be non-repeated strings.");
        params.bannedWords = bannedWords;
    }

    if (min !== undefined && (!Number.isInteger(min) || min < 8 || min > 32)) throw customError(1500, "If you provide a minimum it must be valid.");
    if (max !== undefined && (!Number.isInteger(max) || max < 32 || max > 100)) throw customError(1500, "If you provide a maximum it must be valid.");
    if (min !== undefined) params.min = min;
    if (max !== undefined) params.max = max;

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.PasswordValidationResult>("isValidPwd", data);
        return await resilienceManager.executeWithResilience<Interfaces.PasswordValidationResult>(
            axiosClient,
            {
                method: "GET",
                url: "/public/validPwd",
                params
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.get("/public/validPwd", { params });
        return response.data;
    }
};
