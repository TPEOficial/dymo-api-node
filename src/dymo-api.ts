import axios from "axios";
import * as PrivateAPI from "./private-api";
import * as PublicAPI from "./public-api";
import config from "./config";

const customError = (code: number, message: string): Error => {
    const error = new Error();
    return Object.assign(error, { code, message: `[${config.lib.name}] ${message}` });
};

interface TokensResponse {
    root: boolean;
    api: boolean;
}

interface Tokens {
    root?: string;
    api?: string;
}

class DymoAPI {
    private rootApiKey: string | null;
    private apiKey: string | null;
    private tokensResponse: TokensResponse | null;
    private lastFetchTime: Date | null;

    constructor({ rootApiKey = null, apiKey = null }: { rootApiKey?: string | null; apiKey?: string | null }) {
        this.rootApiKey = rootApiKey;
        this.apiKey = apiKey;
        this.tokensResponse = null;
        this.lastFetchTime = null;
        this.initializeTokens(); // Calls the function to obtain tokens when creating the object.
    }

    private async getTokens(): Promise<TokensResponse | undefined> {
        const currentTime = new Date();
        if (this.tokensResponse && this.lastFetchTime && (currentTime.getTime() - this.lastFetchTime.getTime()) < 5 * 60 * 1000) {
            console.log(`[${config.lib.name}] Using cached tokens response.`);
            return this.tokensResponse;
        }

        const tokens: Tokens = {};
        if (this.rootApiKey) tokens.root = `Bearer ${this.rootApiKey}`;
        if (this.apiKey) tokens.api = `Bearer ${this.apiKey}`;

        try {
            if (Object.keys(tokens).length === 0) return;

            const response = await axios.post<{ data: TokensResponse }>(
                "https://api.tpeoficial.com/v1/dvr/tokens",
                { tokens }
            );

            if (tokens.root && response.data.data.root === false) throw customError(3000, "Invalid root token.");
            if (tokens.api && response.data.data.api === false) throw customError(3000, "Invalid API token.");

            this.tokensResponse = response.data.data;
            this.lastFetchTime = currentTime;
            console.log(`[${config.lib.name}] Tokens initialized successfully.`);
            return this.tokensResponse;
        } catch (error: any) {
            throw customError(5000, error.message);
        }
    }

    private async initializeTokens() {
        try {
            await this.getTokens();
        } catch (error: any) {
            throw customError(5000, `Error initializing tokens: ${error.message}`);
        }
    }

    // FUNCTIONS / Private.
    async isValidData(data: any): Promise<any> {
        return await PrivateAPI.isValidData(this.apiKey, data);
    }

    // FUNCTIONS / Public.
    async getPrayerTimes(data: any): Promise<any> {
        return await PublicAPI.getPrayerTimes(data);
    }

    async satinizer(data: any): Promise<any> {
        return await PublicAPI.satinizer(data);
    }

    async isValidPwd(data: any): Promise<any> {
        return await PublicAPI.isValidPwd(data);
    }

    async newURLEncrypt(data: any): Promise<any> {
        return await PublicAPI.newURLEncrypt(data);
    }
}

export { DymoAPI };