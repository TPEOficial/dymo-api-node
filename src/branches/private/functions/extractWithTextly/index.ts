import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Extracts structured data from a given string using a secure endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the ExtractWithTextly interface, containing 'data' and 'format' fields.
 *               The 'data' field is the string from which structured data should be extracted.
 *               The 'format' field is an object defining the structure of the data to be extracted.
 * 
 * @returns A promise that resolves to the response data containing the extracted structured data.
 * 
 * @throws Will throw an error if the token is null, if 'data' or 'format' are not defined, 
 *         or if an error occurs during the request to the extraction endpoint.
 */
export const extractWithTextly = async (axiosClient: AxiosInstance, data: Interfaces.ExtractWithTextly): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (!data.data) throw customError(1500, "No data provided.");
    if (!data.format) throw customError(1500, "No format provided.");
    try {
        const response = await axiosClient.post("/private/textly/extract", data, { headers: { "Content-Type": "application/json" } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};