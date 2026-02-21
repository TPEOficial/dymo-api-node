import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface IsValidEmailParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    email: Interfaces.EmailValidator;
    rules: Interfaces.EmailValidatorRules;
}

/**
 * Validates an email using a secure verification endpoint.
 */
export const isValidEmail = async ({
    axiosClient,
    resilienceManager,
    email,
    rules
}: IsValidEmailParams): Promise<Interfaces.EmailValidatorResponse> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            email: typeof email === "string" ? email : "",
            allow: true,
            reasons: [],
            response: "CHANGE TO LIVE MODE" as any
        };
    }

    const plugins = [
        rules.deny.includes("NO_MX_RECORDS") ? "mxRecords" : undefined,
        rules.deny.includes("NO_REACHABLE") ? "reachable" : undefined,
        rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined,
        rules.deny.includes("NO_GRAVATAR") ? "gravatar" : undefined
    ].filter(Boolean);

    let responseEmail: Interfaces.DataEmailValidationAnalysis;

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.DataValidationAnalysis>("isValidEmail", email);
        const response = await resilienceManager.executeWithResilience<Interfaces.DataValidationAnalysis>(
            axiosClient,
            {
                method: "POST",
                url: "/private/secure/verify",
                data: { email, plugins }
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
        responseEmail = response.email;
    } else {
        const response = await axiosClient.post("/private/secure/verify", { email, plugins }, { headers: { "Content-Type": "application/json" } });
        responseEmail = response.data.email;
    }

    // If the response doesn't have email data or is invalid, return invalid
    if (!responseEmail || !responseEmail.valid) {
        return {
            email: responseEmail?.email || (typeof email === "string" ? email : ""),
            allow: false,
            reasons: ["INVALID"] as Interfaces.NegativeEmailRules[],
            response: responseEmail as Interfaces.DataEmailValidationAnalysis
        };
    }

    const reasons: Interfaces.NegativeEmailRules[] = [];

    if (rules.deny.includes("FRAUD") && responseEmail.fraud) reasons.push("FRAUD");
    if (rules.deny.includes("PROXIED_EMAIL") && responseEmail.proxiedEmail) reasons.push("PROXIED_EMAIL");
    if (rules.deny.includes("FREE_SUBDOMAIN") && responseEmail.freeSubdomain) reasons.push("FREE_SUBDOMAIN");
    if (rules.deny.includes("PERSONAL_EMAIL") && !responseEmail.corporate) reasons.push("PERSONAL_EMAIL");
    if (rules.deny.includes("CORPORATE_EMAIL") && responseEmail.corporate) reasons.push("CORPORATE_EMAIL");
    if (rules.deny.includes("NO_MX_RECORDS") && responseEmail.plugins?.mxRecords?.length === 0) reasons.push("NO_MX_RECORDS");
    if (rules.deny.includes("NO_REPLY_EMAIL") && responseEmail.noReply) reasons.push("NO_REPLY_EMAIL");
    if (rules.deny.includes("ROLE_ACCOUNT") && responseEmail.roleAccount) reasons.push("ROLE_ACCOUNT");
    if (rules.deny.includes("NO_REACHABLE") && responseEmail.plugins?.reachable && responseEmail.plugins.reachable.reachability === "invalid") reasons.push("NO_REACHABLE");
    if (rules.deny.includes("HIGH_RISK_SCORE") && (responseEmail.plugins?.riskScore ?? 0) >= 80) reasons.push("HIGH_RISK_SCORE");
    if (rules.deny.includes("NO_GRAVATAR") && !responseEmail.plugins?.gravatar) reasons.push("NO_GRAVATAR");

    return {
        email: responseEmail.email,
        allow: reasons.length === 0,
        reasons,
        response: responseEmail
    };
};
