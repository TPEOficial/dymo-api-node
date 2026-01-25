import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface IsValidPhoneParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    phone: Interfaces.PhoneValidator;
    rules: Interfaces.PhoneValidatorRules;
}

/**
 * Validates a phone number using a secure verification endpoint.
 */
export const isValidPhone = async ({
    axiosClient,
    resilienceManager,
    phone,
    rules
}: IsValidPhoneParams): Promise<Interfaces.PhoneValidatorResponse> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            phone: typeof phone === "string" ? phone : "",
            allow: true,
            reasons: [],
            response: "CHANGE TO LIVE MODE" as any
        };
    }

    const plugins = [
        rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined
    ].filter(Boolean);

    let responsePhone: Interfaces.DataPhoneValidationAnalysis;

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.DataValidationAnalysis>("isValidPhone", phone);
        const response = await resilienceManager.executeWithResilience<Interfaces.DataValidationAnalysis>(
            axiosClient,
            {
                method: "POST",
                url: "/private/secure/verify",
                data: { phone, plugins }
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
        responsePhone = response.phone;
    } else {
        const response = await axiosClient.post("/private/secure/verify", { phone, plugins }, { headers: { "Content-Type": "application/json" } });
        responsePhone = response.data.phone;
    }

    // If the response doesn't have phone data or is invalid, return invalid
    if (!responsePhone || !responsePhone.valid) {
        return {
            phone: responsePhone?.phone || (typeof phone === "string" ? phone : ""),
            allow: false,
            reasons: ["INVALID"] as Interfaces.NegativePhoneRules[],
            response: responsePhone as Interfaces.DataPhoneValidationAnalysis
        };
    }

    const reasons: Interfaces.NegativePhoneRules[] = [];

    if (rules.deny.includes("FRAUD") && responsePhone.fraud) reasons.push("FRAUD");
    if (rules.deny.includes("HIGH_RISK_SCORE") && (responsePhone.plugins?.riskScore ?? 0) >= 80) reasons.push("HIGH_RISK_SCORE");

    // Country block rules.
    for (const rule of rules.deny) {
        if (rule.startsWith("COUNTRY:")) {
            const block = rule.split(":")[1];
            if (responsePhone.countryCode === block) reasons.push(`COUNTRY:${block}` as Interfaces.NegativePhoneRules);
        }
    }

    return {
        phone: responsePhone.phone,
        allow: reasons.length === 0,
        reasons,
        response: responsePhone
    };
};
