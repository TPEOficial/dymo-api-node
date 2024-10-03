import axios from "axios";
import config, { BASE_URL } from "../config";

const customError = (code: number, message: string): Error => {
    return Object.assign(new Error(), { code, message: `[${config.lib.name}] ${message}` });
};

interface PrayerTimesData {
    lat?: number;
    lon?: number;
};

interface InputSatinizerData {
    input?: string;
};

interface IsValidPwdData {
    email?: string;
    password?: string;
    bannedWords?: string | string[];
    min?: number;
    max?: number;
};

interface NewURLEncryptData {
    url?: string;
};

export const getPrayerTimes = async (data: PrayerTimesData): Promise<any> => {
    const { lat, lon } = data;
    if (lat === undefined || lon === undefined) throw customError(1000, "You must provide a latitude and longitude.");
    try {
        const response = await axios.get(`${BASE_URL}/v1/public/islam/prayertimes`, { params: data });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.message);
    }
};

export const satinizer = async (data: InputSatinizerData): Promise<any> => {
    const { input } = data;
    if (input === undefined) throw customError(1000, "You must specify at least the input.");
    try {
        const response = await axios.get(`${BASE_URL}/v1/public/inputSatinizer`, { params: { input: encodeURIComponent(input) } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.message);
    }
};

export const isValidPwd = async (data: IsValidPwdData): Promise<any> => {
    let { email, password, bannedWords, min, max } = data;
    if (password === undefined) throw customError(1000, "You must specify at least the password.");
    const params: { [key: string]: any } = { password: encodeURIComponent(password) };

    if (email) {
        if (!/^[a-zA-Z0-9._\-+]+@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) throw customError(1500, "If you provide an email address it must be valid.");
        params.email = encodeURIComponent(email);
    }

    if (bannedWords) {
        if (typeof bannedWords === "string") bannedWords = bannedWords.slice(1, -1).trim().split(",").map(item => item.trim());
        
        if (!Array.isArray(bannedWords) || bannedWords.length > 10) 
            throw customError(1500, "If you provide a list of banned words; the list may not exceed 10 words and must be of array type.");
        if (!bannedWords.every(word => typeof word === "string") || new Set(bannedWords).size !== bannedWords.length) 
            throw customError(1500, "If you provide a list of banned words; all elements must be non-repeated strings.");
        params.bannedWords = bannedWords;
    }

    if (min !== undefined && (!Number.isInteger(min) || min < 8 || min > 32)) throw customError(1500, "If you provide a minimum it must be valid.");
    if (max !== undefined && (!Number.isInteger(max) || max < 32 || max > 100)) throw customError(1500, "If you provide a maximum it must be valid.");
    if (min !== undefined) params.min = min;
    if (max !== undefined) params.max = max;

    try {
        const response = await axios.get(`${BASE_URL}/v1/public/validPwd`, { params });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.message);
    }
};

export const newURLEncrypt = async (data: NewURLEncryptData): Promise<any> => {
    const { url } = data;
    if (url === undefined || (!url.startsWith("https://") && !url.startsWith("http://"))) throw customError(1500, "You must provide a valid url.");
    try {
        const response = await axios.get(`${BASE_URL}/v1/public/url-encrypt`, { params: data });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.message);
    }
};