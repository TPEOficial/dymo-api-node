import axios from "axios";

const config = {
    lib: {
        name: "Dymo API",
        dir: "dymo-api"
    },
    env: {
        baseUrl: "https://api.tpeoficial.com"
    }
};

export default config;

let BASE_URL: string = config.env.baseUrl;

export const setBaseUrl = (baseUrl: string): void => {
    if (/^(https:\/\/api\.tpeoficial\.com$|http:\/\/(localhost:\d+|dymoapi:\d+))$/.test(baseUrl)) BASE_URL = baseUrl;
    else throw new Error("[Dymo API] Invalid URL. It must be https://api.tpeoficial.com or start with http://localhost or http://dymoapi followed by a port.");
};

const axiosApiUrl = axios.create({
    baseURL: `${BASE_URL}/v1`,
    headers: {
        "User-Agent": "DymoAPISDK/1.0.0"
    },
    timeout: 5000
});

export { BASE_URL, axiosApiUrl };