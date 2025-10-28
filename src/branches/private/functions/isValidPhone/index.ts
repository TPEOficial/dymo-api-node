import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Validates an phone using a secure verification endpoint.
 *
 * @param {string | null} token - Authentication token (required).
 * @param {Interfaces.PhoneValidator} phone - Phone to validate.
 * @param {Interfaces.PhoneValidatorRules} [rules] - Deny rules. Defaults to ["FRAUD", "INVALID"].
 *
 * Deny rules (some are premium ⚠️):
 * - "FRAUD", "INVALID", "HIGH_RISK_SCORE" ⚠️
 *
 * @returns {Promise<boolean>} True if the phone passes all deny rules, false otherwise.
 * @throws Error if token is null, rules are empty, or request fails.
 *
 * @example
 * const valid = await isValidPhone(apiToken, "+34617509462", { deny: ["FRAUD", "INVALID" });
 */
export const isValidPhone = async (
    axiosClient: AxiosInstance,
    phone: Interfaces.PhoneValidator,
    rules: Interfaces.PhoneValidatorRules
): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            phone,
            allow: true,
            reasons: [],
            response: "CHANGE TO LIVE MODE"
        }
    }

    try {
        const responsePhone = (await axiosClient.post("/private/secure/verify", {
            phone,
            plugins: [
                rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined
            ].filter(Boolean)
        }, { headers: { "Content-Type": "application/json" } })).data.phone;

        let reasons: string[] = [];

        if (rules.deny.includes("INVALID") && !responsePhone.valid) {
            return {
                phone: responsePhone.phone,
                allow: false,
                reasons: ["INVALID"],
                response: responsePhone
            };
        }
        if (rules.deny.includes("FRAUD") && responsePhone.fraud) reasons.push("FRAUD");
        if (rules.deny.includes("HIGH_RISK_SCORE") && responsePhone.plugins.riskScore >= 80) reasons.push("HIGH_RISK_SCORE");

        return {
            phone: responsePhone.phone,
            allow: reasons.length === 0,
            reasons,
            response: responsePhone
        };
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};