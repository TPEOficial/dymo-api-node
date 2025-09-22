import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Retrieves the prayer times for the given location.
 *
 * This method requires a latitude and longitude to be provided in the
 * data object. If either of these are not provided, it will throw an error.
 *
 * @param {Interfaces.PrayerTimesData} data - The data to be sent.
 * @param {number} data.lat - The latitude of the location.
 * @param {number} data.lon - The longitude of the location.
 * @returns {Promise<any>} A promise that resolves to the response from the server.
 * @throws Will throw an error if there is an issue with the prayer times retrieval process.
 *
 * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/public/prayertimes)
 */
export const getPrayerTimes = async (axiosClient: AxiosInstance, data: Interfaces.PrayerTimesData): Promise<any> => {
    const { lat, lon } = data;
    if (lat === undefined || lon === undefined) throw customError(1000, "You must provide a latitude and longitude.");
    try {
        const response = await axiosClient.get("/public/islam/prayertimes", { params: data });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};