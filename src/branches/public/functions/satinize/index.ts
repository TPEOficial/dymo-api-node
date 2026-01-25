import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface SatinizeParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    input: string;
}

/**
 * Sanitizes the input, replacing any special characters with their HTML entities.
 */
export const satinize = async ({
    axiosClient,
    resilienceManager,
    input
}: SatinizeParams): Promise<Interfaces.SatinizedInputAnalysis> => {
    if (input === undefined) throw customError(1000, "You must specify at least the input.");

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.SatinizedInputAnalysis>("satinize", input);
        return await resilienceManager.executeWithResilience<Interfaces.SatinizedInputAnalysis>(
            axiosClient,
            {
                method: "GET",
                url: "/public/inputSatinizer",
                params: { input: encodeURIComponent(input) }
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.get("/public/inputSatinizer", { params: { input: encodeURIComponent(input) } });
        return response.data;
    }
};
