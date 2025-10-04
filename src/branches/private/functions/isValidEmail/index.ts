import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Validates an email using a secure verification endpoint.
 *
 * @param {string | null} token - Authentication token (required).
 * @param {Interfaces.EmailValidator} email - Email to validate.
 * @param {Interfaces.EmailValidatorRules} [rules] - Deny rules. Defaults to ["FRAUD", "INVALID", "NO_MX_RECORDS", "NO_REPLY_EMAIL"].
 *
 * Deny rules (some are premium ⚠️):
 * - "FRAUD", "INVALID", "NO_MX_RECORDS" ⚠️, "PROXIED_EMAIL" ⚠️, "FREE_SUBDOMAIN" ⚠️,
 *   "PERSONAL_EMAIL", "CORPORATE_EMAIL", "NO_REPLY_EMAIL", "ROLE_ACCOUNT", "NO_REACHABLE", "HIGH_RISK_SCORE" ⚠️
 *
 * @returns {Promise<boolean>} True if the email passes all deny rules, false otherwise.
 * @throws Error if token is null, rules are empty, or request fails.
 *
 * @example
 * const valid = await isValidEmail(apiToken, "user@example.com", { deny: ["FRAUD", "NO_MX_RECORDS"] });
 */
export const isValidEmail = async (
    axiosClient: AxiosInstance,
    email: Interfaces.EmailValidator,
    rules: Interfaces.EmailValidatorRules
): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            email,
            allow: true,
            reasons: [],
            response: "CHANGE TO LIVE MODE"
        }
    }

    try {
        const responseEmail = (await axiosClient.post("/private/secure/verify", {
            email,
            plugins: [
                rules.deny.includes("NO_MX_RECORDS") ? "mxRecords" : undefined,
                rules.deny.includes("NO_REACHABLE") ? "reachability" : undefined,
                rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined
            ].filter(Boolean)
        }, { headers: { "Content-Type": "application/json" } })).data.email;

        let reasons: string[] = [];

        if (rules.deny.includes("INVALID") && !responseEmail.valid) {
            return {
                email: responseEmail.email,
                allow: false,
                reasons: ["INVALID"],
                response: responseEmail
            };
        }
        if (rules.deny.includes("FRAUD") && responseEmail.fraud) reasons.push("FRAUD");
        if (rules.deny.includes("PROXIED_EMAIL") && responseEmail.proxiedEmail) reasons.push("PROXIED_EMAIL");
        if (rules.deny.includes("FREE_SUBDOMAIN") && responseEmail.freeSubdomain) reasons.push("FREE_SUBDOMAIN");
        if (rules.deny.includes("PERSONAL_EMAIL") && !responseEmail.corporate) reasons.push("PERSONAL_EMAIL");
        if (rules.deny.includes("CORPORATE_EMAIL") && responseEmail.corporate) reasons.push("CORPORATE_EMAIL");
        if (rules.deny.includes("NO_MX_RECORDS") && responseEmail.plugins.mxRecords.length === 0) reasons.push("NO_MX_RECORDS");
        if (rules.deny.includes("NO_REPLY_EMAIL") && responseEmail.noReply) reasons.push("NO_REPLY_EMAIL");
        if (rules.deny.includes("ROLE_ACCOUNT") && responseEmail.plugins.roleAccount) reasons.push("ROLE_ACCOUNT");
        if (rules.deny.includes("NO_REACHABLE") && !responseEmail.plugins.reachable) reasons.push("NO_REACHABLE");
        if (rules.deny.includes("HIGH_RISK_SCORE") && responseEmail.plugins.riskScore >= 80) reasons.push("HIGH_RISK_SCORE");

        return {
            email: responseEmail.email,
            allow: reasons.length === 0,
            reasons,
            response: responseEmail
        };
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};