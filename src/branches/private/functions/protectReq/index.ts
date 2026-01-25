import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import { handleRequest } from "./requestHandler";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface ProtectReqParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    req: Interfaces.HTTPRequest;
    rules: Interfaces.WafRules;
}

const isWellKnownBot = (ua: string): ua is Interfaces.WellKnownBot => {
    return (Object.values(Interfaces.categories).flat() as string[]).includes(ua);
};

/**
 * Protects a request using the WAF verification endpoint.
 */
export const protectReq = async <T>({
    axiosClient,
    resilienceManager,
    req,
    rules
}: ProtectReqParams): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    const reqData = handleRequest(req);

    if (!reqData.userAgent || !reqData.ip) throw customError(1500, "You must provide user agent and ip.");

    if (rules.mode === "DRY_RUN") {
        console.warn("[Dymo API] DRY_RUN mode is enabled. No requests with real data will be processed until you switch to LIVE mode.");
        return {
            ip: reqData.ip,
            userAgent: reqData.userAgent,
            allow: true,
            reasons: []
        };
    }

    const requestData = {
        ip: reqData.ip,
        userAgent: reqData.userAgent,
        allowBots: rules.allowBots,
        deny: rules.deny
    };

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<any>("protectReq", req);
        return await resilienceManager.executeWithResilience(
            axiosClient,
            {
                method: "POST",
                url: "/private/waf/verifyRequest",
                data: requestData
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.post("/private/waf/verifyRequest", requestData, { headers: { "Content-Type": "application/json" } });
        return response.data;
    }
};
