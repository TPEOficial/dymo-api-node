import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface IsValidIPParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    ip: Interfaces.IPValidator;
    rules: Interfaces.IPValidatorRules;
}

/**
 * Validates an IP using a secure verification endpoint.
 */
export const isValidIP = async ({
    axiosClient,
    resilienceManager,
    ip,
    rules
}: IsValidIPParams): Promise<Interfaces.IPValidatorResponse> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            ip: typeof ip === "string" ? ip : "",
            allow: true,
            reasons: [],
            response: "CHANGE TO LIVE MODE" as any
        };
    }

    const plugins = [
        rules.deny.includes("TOR_NETWORK") ? "torNetwork" : undefined,
        rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined
    ].filter(Boolean);

    let responseIP: Interfaces.DataIPValidationAnalysis;

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.DataValidationAnalysis>("isValidIP", ip);
        const response = await resilienceManager.executeWithResilience<Interfaces.DataValidationAnalysis>(
            axiosClient,
            {
                method: "POST",
                url: "/private/secure/verify",
                data: { ip, plugins }
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
        responseIP = response.ip;
    } else {
        const response = await axiosClient.post("/private/secure/verify", { ip, plugins }, { headers: { "Content-Type": "application/json" } });
        responseIP = response.data.ip;
    }

    if (!responseIP || !responseIP.valid) {
        return {
            ip: responseIP?.ip || (typeof ip === "string" ? ip : ""),
            allow: false,
            reasons: ["INVALID"] as Interfaces.NegativeIPRules[],
            response: responseIP as Interfaces.DataIPValidationAnalysis
        };
    }

    const reasons: Interfaces.NegativeIPRules[] = [];

    if (rules.deny.includes("FRAUD") && responseIP.fraud) reasons.push("FRAUD");
    if (rules.deny.includes("TOR_NETWORK") && responseIP.plugins?.torNetwork) reasons.push("TOR_NETWORK");
    if (rules.deny.includes("HIGH_RISK_SCORE") && (responseIP.plugins?.riskScore ?? 0) >= 80) reasons.push("HIGH_RISK_SCORE");

    for (const rule of rules.deny) {
        if (rule.startsWith("COUNTRY:")) {
            const block = rule.split(":")[1];
            if (responseIP.countryCode === block) reasons.push(`COUNTRY:${block}` as Interfaces.NegativeIPRules);
        }
    }

    return {
        ip: responseIP.ip,
        allow: reasons.length === 0,
        reasons,
        response: responseIP
    };
};
