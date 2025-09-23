import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import { handleRequest } from "./requestHandler";
import * as Interfaces from "@/lib/types/interfaces";

const isWellKnownBot = (ua: string): ua is Interfaces.WellKnownBot => {
    return (Object.values(Interfaces.categories).flat() as string[]).includes(ua);
};

export const protectReq = async <T>(
    axiosClient: AxiosInstance,
    req: Interfaces.HTTPRequest,
    rules: Interfaces.WafRules
): Promise<any> => {
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
        }
    }

    try {
        const response = await axiosClient.post("/private/waf/verifyRequest", {
            ip: reqData.ip,
            userAgent: reqData.userAgent,
            allowBots: rules.allowBots,
            deny: rules.deny
        }, { headers: { "Content-Type": "application/json" } });

        return response.data;
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};