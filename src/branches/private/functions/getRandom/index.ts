import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface GetRandomParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    data: Interfaces.SRNG;
}

/**
 * Retrieves a random number within a specified range using a secure endpoint.
 */
export const getRandom = async ({
    axiosClient,
    resilienceManager,
    data
}: GetRandomParams): Promise<Interfaces.SRNSummary> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (data.min === undefined || data.max === undefined) throw customError(1500, "Both 'min' and 'max' parameters must be defined.");
    if (data.min >= data.max) throw customError(1500, "'min' must be less than 'max'.");
    if (data.min < -1000000000 || data.min > 1000000000) throw customError(1500, "'min' must be an integer in the interval [-1000000000, 1000000000].");
    if (data.max < -1000000000 || data.max > 1000000000) throw customError(1500, "'max' must be an integer in the interval [-1000000000, 1000000000].");

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.SRNSummary>("getRandom", data);
        return await resilienceManager.executeWithResilience<Interfaces.SRNSummary>(
            axiosClient,
            {
                method: "POST",
                url: "/private/srng",
                data
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.post("/private/srng", data, { headers: { "Content-Type": "application/json" } });
        return response.data;
    }
};
