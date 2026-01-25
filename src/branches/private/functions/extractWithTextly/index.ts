import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface ExtractWithTextlyParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    data: Interfaces.ExtractWithTextly;
}

/**
 * Extracts structured data from a given string using a secure endpoint.
 */
export const extractWithTextly = async ({
    axiosClient,
    resilienceManager,
    data
}: ExtractWithTextlyParams): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (!data.data) throw customError(1500, "No data provided.");
    if (!data.format) throw customError(1500, "No format provided.");

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<any>("extractWithTextly", data);
        return await resilienceManager.executeWithResilience(
            axiosClient,
            {
                method: "POST",
                url: "/private/textly/extract",
                data
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.post("/private/textly/extract", data, { headers: { "Content-Type": "application/json" } });
        return response.data;
    }
};