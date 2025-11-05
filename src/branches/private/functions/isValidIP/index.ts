import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Validates an ip using a secure verification endpoint.
 *
 * @param {string | null} token - Authentication token (required).
 * @param {Interfaces.IPValidator} ip - IP to validate.
 * @param {Interfaces.IPValidatorRules} [rules] - Deny rules. Defaults to ["FRAUD", "INVALID", "TOR_NETWORK"].
 *
 * Deny rules (some are premium ⚠️):
 * - "FRAUD", "INVALID", "TOR_NETWORK" ⚠️, "HIGH_RISK_SCORE" ⚠️
 *
 * @returns {Promise<boolean>} True if the IP passes all deny rules, false otherwise.
 * @throws Error if token is null, rules are empty, or request fails.
 *
 * @example
 * const valid = await isValidIP(apiToken, "52.94.236.248", { deny: ["FRAUD", "TOR_NETWORK", "COUNTRY:RU"] });
 */
export const isValidIP = async (
    axiosClient: AxiosInstance,
    ip: Interfaces.IPValidator,
    rules: Interfaces.IPValidatorRules
): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            ip,
            allow: true,
            reasons: [],
            response: "CHANGE TO LIVE MODE"
        }
    }

    try {
        const responseIP = (await axiosClient.post("/private/secure/verify", {
            ip,
            plugins: [
                rules.deny.includes("TOR_NETWORK") ? "torNetwork" : undefined,
                rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined
            ].filter(Boolean)
        }, { headers: { "Content-Type": "application/json" } })).data.ip;

        let reasons: string[] = [];

        if (rules.deny.includes("INVALID") && !responseIP.valid) {
            return {
                ip: responseIP.ip,
                allow: false,
                reasons: ["INVALID"],
                response: responseIP
            };
        }
        if (rules.deny.includes("FRAUD") && responseIP.fraud) reasons.push("FRAUD");
        if (rules.deny.includes("TOR_NETWORK") && !responseIP.plugins.gravatar) reasons.push("TOR_NETWORK");
        if (rules.deny.includes("HIGH_RISK_SCORE") && responseIP.plugins.riskScore >= 80) reasons.push("HIGH_RISK_SCORE");

        // Country block rules.
        for (const rule of rules.deny) {
            if (rule.startsWith("COUNTRY:")) {
                const block = rule.split(":")[1]; // Extract country code.
                if (responseIP.countryCode === block) reasons.push(`COUNTRY:${block}`);
            }
        }

        return {
            ip: responseIP.ip,
            allow: reasons.length === 0,
            reasons,
            response: responseIP
        };
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};