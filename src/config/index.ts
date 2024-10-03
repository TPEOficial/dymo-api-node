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

export const setBaseUrl = (isLocal: boolean): void => {
    BASE_URL = isLocal ? "http://localhost:3050" : config.env.baseUrl;
};

export { BASE_URL };