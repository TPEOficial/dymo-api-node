import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Retrieves a random number within a specified range using a secure endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the SRNG interface, containing 'min' and 'max' fields, 
 *               which define the inclusive range within which the random number should be generated.
 * 
 * @returns A promise that resolves to the response data containing the random number.
 * 
 * @throws Will throw an error if the token is null, if 'min' or 'max' are not defined, 
 *         if 'min' is not less than 'max', if 'min' or 'max' are out of the allowed range,
 *         or if an error occurs during the request to the random number generator endpoint.
 */
export const getRandom = async (axiosClient: AxiosInstance, data: Interfaces.SRNG): Promise<any> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
    if (!data.min || !data.max) throw customError(1500, "Both 'min' and 'max' parameters must be defined.");
    if (data.min >= data.max) throw customError(1500, "'min' must be less than 'max'.");
    if (data.min < -1000000000 || data.min > 1000000000) throw customError(1500, "'min' must be an integer in the interval [-1000000000}, 1000000000].");
    if (data.max < -1000000000 || data.max > 1000000000) throw customError(1500, "'max' must be an integer in the interval [-1000000000}, 1000000000].");
    try {
        const response = await axiosClient.post("/private/srng", data, { headers: { "Content-Type": "application/json" } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};