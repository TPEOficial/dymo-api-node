import { type AxiosInstance } from "axios";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";

/**
 * Validates a password based on the given parameters.
 *
 * This method requires the password to be provided in the data object.
 * If the password is not provided, it will throw an error. The method
 * will validate the password against the following rules:
 *  - The password must be at least 8 characters long.
 *  - The password must be at most 32 characters long.
 *  - The password must contain at least one uppercase letter.
 *  - The password must contain at least one lowercase letter.
 *  - The password must contain at least one number.
 *  - The password must contain at least one special character.
 *  - The password must not contain any of the given banned words.
 *
 * @param {Interfaces.IsValidPwdData} data - The data to be sent.
 * @param {string} [data.email] - Optional email associated with the password.
 * @param {string} data.password - The password to be validated.
 * @param {string | string[]} [data.bannedWords] - The list of banned words that the password must not contain.
 * @param {number} [data.min] - Minimum length of the password. Defaults to 8 if not provided.
 * @param {number} [data.max] - Maximum length of the password. Defaults to 32 if not provided.
 * @returns {Promise<Interfaces.PasswordValidationResult>} A promise that resolves to the response from the server.
 * @throws Will throw an error if there is an issue with the password validation process.
 *
 * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/public/password-validator)
*/
export const isValidPwd = async (axiosClient: AxiosInstance, data: Interfaces.IsValidPwdData): Promise<any> => {
    let { email, password, bannedWords, min, max } = data;
    if (password === undefined) throw customError(1000, "You must specify at least the password.");
    const params: { [key: string]: any; } = { password: encodeURIComponent(password) };

    if (email) {
        if (!/^[a-zA-Z0-9._\-+]+@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) throw customError(1500, "If you provide an email address it must be valid.");
        params.email = encodeURIComponent(email);
    }

    if (bannedWords) {
        if (typeof bannedWords === "string") bannedWords = bannedWords.slice(1, -1).trim().split(",").map(item => item.trim());
        if (!Array.isArray(bannedWords) || bannedWords.length > 10) throw customError(1500, "If you provide a list of banned words; the list may not exceed 10 words and must be of array type.");
        if (!bannedWords.every(word => typeof word === "string") || new Set(bannedWords).size !== bannedWords.length) throw customError(1500, "If you provide a list of banned words; all elements must be non-repeated strings.");
        params.bannedWords = bannedWords;
    }

    if (min !== undefined && (!Number.isInteger(min) || min < 8 || min > 32)) throw customError(1500, "If you provide a minimum it must be valid.");
    if (max !== undefined && (!Number.isInteger(max) || max < 32 || max > 100)) throw customError(1500, "If you provide a maximum it must be valid.");
    if (min !== undefined) params.min = min;
    if (max !== undefined) params.max = max;

    try {
        const response = await axiosClient.get("/public/validPwd", { params });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};