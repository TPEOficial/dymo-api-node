import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Validates the provided data using a secure verification endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the Validator interface, containing at least one of the following fields: 
 *               url, email, phone, domain, creditCard, ip, wallet or user agent.
 * 
 * @returns A promise that resolves to the response data from the verification endpoint.
 * 
 * @throws Will throw an error if the token is null, if none of the required fields are present in the data,
 *         or if an error occurs during the verification request.
 */
export const isValidData = async (axiosClient: AxiosInstance, data: Interfaces.Validator): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (!Object.keys(data).some((key) => ["url", "email", "phone", "domain", "creditCard", "ip", "wallet", "userAgent", "iban"].includes(key) && data.hasOwnProperty(key))) throw customError(1500, "You must provide at least one parameter.");
    try {
        const response = await axiosClient.post("/private/secure/verify", data, { headers: { "Content-Type": "application/json" } });
        return response.data;
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};