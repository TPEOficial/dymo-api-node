import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface GetPrayerTimesParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    data: Interfaces.PrayerTimesData;
}

/**
 * Retrieves the prayer times for the given location.
 */
export const getPrayerTimes = async ({
    axiosClient,
    resilienceManager,
    data
}: GetPrayerTimesParams): Promise<Interfaces.CountryPrayerTimes> => {
    const { lat, lon } = data;
    if (lat === undefined || lon === undefined) throw customError(1000, "You must provide a latitude and longitude.");

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.CountryPrayerTimes>("getPrayerTimes", data);
        return await resilienceManager.executeWithResilience<Interfaces.CountryPrayerTimes>(
            axiosClient,
            {
                method: "GET",
                url: "/public/islam/prayertimes",
                params: data
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.get("/public/islam/prayertimes", { params: data });
        return response.data;
    }
};
