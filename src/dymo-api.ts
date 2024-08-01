import axios from "axios";
import { PrivateAPI } from "./private-api";
import { PublicAPI } from "./public-api";

const config = require("../config.cjs");

const customError = (code: number, message: string) => {
    const error = new Error();
    return Object.assign(error, { code, message: `[${config.lib.name}] ${message}` });
};

class DymoAPI {
    private rootApiKey: string | null;
    private apiKey: string | null;
    private tokensResponse: any;
    private lastFetchTime: Date | null;

    constructor({ rootApiKey = null, apiKey = null }: { rootApiKey?: string, apiKey?: string }) {
        this.rootApiKey = rootApiKey;
        this.apiKey = apiKey;
        this.tokensResponse = null;
        this.lastFetchTime = null;
        this.initializeTokens();
    }

    private async getTokens() {
        const currentTime = new Date();
        if (this.tokensResponse && this.lastFetchTime && (currentTime.getTime() - this.lastFetchTime.getTime()) < 5 * 60 * 1000) {
            console.log(`[${config.lib.name}] Using cached tokens response.`);
            return this.tokensResponse;
        }

        const tokens: { root?: string, api?: string } = {};
        if (this.rootApiKey) tokens.root = `Bearer ${this.rootApiKey}`;
        if (this.apiKey) tokens.api = `Bearer ${this.apiKey}`;

        try {
            if (Object.keys(tokens).length === 0) return;

            const response = await axios.post('https://api.tpeoficial.com/v1/dvr/tokens', { tokens });
            if (tokens.root && response.data.root === false) throw customError(3000, "Invalid root token.");
            if (tokens.api && response.data.api === false) throw customError(3000, "Invalid API token.");

            this.tokensResponse = response.data;
            this.lastFetchTime = currentTime;
            console.log(`[${config.lib.name}] Tokens initialized successfully.`);
            return response.data;
        } catch (error) {
            throw customError(5000, error.message);
        }
    }

    private async initializeTokens() {
        try {
            await this.getTokens();
        } catch (error) {
            throw customError(5000, `Error initializing tokens: ${error.message}`);
        }
    }

    // FUNCTIONS / Private.
    async isValidData(data: any) { 
        return await PrivateAPI.isValidData(this.apiKey, data); 
    }

    // FUNCTIONS / Public.
    async getPrayerTimes(data: any) { 
        return await PublicAPI.getPrayerTimes(data); 
    }

    async inputSatinizer(data: any) { 
        return await PublicAPI.inputSatinizer(data); 
    }

    async isValidPwd(data: any) { 
        return await PublicAPI.isValidPwd(data); 
    }

    async newURLEncrypt(data: any) { 
        return await PublicAPI.newURLEncrypt(data); 
    }
}

export { DymoAPI };