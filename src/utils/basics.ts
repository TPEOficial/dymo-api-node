import config from "../config";

export const customError = (code: number, message: string): Error => {
    return Object.assign(new Error(), { code, message: `[${config.lib.name}] ${message}` });
};

export const validBaseURL = (baseUrl: string): string => {
    if (/^(https:\/\/api\.tpeoficial\.com$|http:\/\/(localhost:\d+|dymoapi:\d+))$/.test(baseUrl)) return baseUrl;
    else throw new Error("[Dymo API] Invalid URL. It must be https://api.tpeoficial.com or start with http://localhost or http://dymoapi followed by a port.");
};