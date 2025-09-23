import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Sanitizes the input, replacing any special characters with their HTML entities.
 *
 * @param {Interfaces.InputSatinizerData} data - The data to be sent.
 * @param {string} data.input - The input to be sanitized.
 * @returns {Promise<any>} A promise that resolves to the response from the server.
 * @throws Will throw an error if there is an issue with the sanitization process.
 *
 * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/public/input-satinizer)
 */
export const satinize = async (axiosClient: AxiosInstance, input: string): Promise<any> => {
    if (input === undefined) throw customError(1000, "You must specify at least the input.");
    try {
        const response = await axiosClient.get("/public/inputSatinizer", { params: { input: encodeURIComponent(input) } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};