import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface IsValidDataRawParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    data: Interfaces.Validator;
}

/**
 * Validates the provided data using a secure verification endpoint.
 */
export const isValidDataRaw = async ({
    axiosClient,
    resilienceManager,
    data
}: IsValidDataRawParams): Promise<Interfaces.DataValidationAnalysis> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (!Object.keys(data).some((key) => ["url", "email", "phone", "domain", "creditCard", "ip", "wallet", "userAgent", "iban"].includes(key) && data.hasOwnProperty(key))) throw customError(1500, "You must provide at least one parameter.");

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.DataValidationAnalysis>("isValidDataRaw", data);
        return await resilienceManager.executeWithResilience<Interfaces.DataValidationAnalysis>(
            axiosClient,
            {
                method: "POST",
                url: "/private/secure/verify",
                data
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.post("/private/secure/verify", data, { headers: { "Content-Type": "application/json" } });
        return response.data;
    }
};
