import axios from "axios";
import * as PrivateAPI from "./private-api";
import * as PublicAPI from "./public-api";
import config from "./config/config";
import { createCustomError } from "./utils/custom-error";

class DymoAPI {
    private rootApiKey: string | null;
    private apiKey: string | null;
    private tokensResponse: TokensResponse | null;
    private lastFetchTime: Date | null;

    constructor({
        rootApiKey = null,
        apiKey = null,
    }: DymoAPIConstructorOptions) {
        this.rootApiKey = rootApiKey;
        this.apiKey = apiKey;
        this.tokensResponse = null;
        this.lastFetchTime = null;
        this.initializeTokens(); // Calls the function to obtain tokens when creating the object.
    }

    private async initializeTokens() {
        try {
            await this.getTokens();
        } catch (error: any) {
            throw createCustomError(
                5000,
                `Error initializing tokens: ${error.message}`
            );
        }
    }

    private async getTokens(): Promise<TokensResponse | null> {
        const currentTime = new Date();
        if (this.isLastFetchTimeMinorThanFiveMinutes(currentTime)) {
            console.log(`[${config.lib.name}] Using cached tokens response.`);
            return this.tokensResponse;
        }

        const tokens: Tokens = this.createTokens();

        try {
            if (Object.keys(tokens).length === 0) return null;

            const axiosResponse = await axios.post<{ data: TokensResponse }>(
                "https://api.tpeoficial.com/v1/dvr/tokens",
                { tokens }
            );
            const data = axiosResponse.data.data;
            this.verifyTokens(tokens, data);

            this.tokensResponse = data;
            this.lastFetchTime = currentTime;
            console.log(
                `[${config.lib.name}] Tokens initialized successfully.`
            );

            return this.tokensResponse;
        } catch (error: any) {
            throw createCustomError(5000, error.message);
        }
    }

    private isLastFetchTimeMinorThanFiveMinutes(currentTime: Date) {
        return (
            this.tokensResponse &&
            this.lastFetchTime &&
            currentTime.getTime() - this.lastFetchTime.getTime() < 5 * 60 * 1000
        );
    }

    private createTokens() {
        const tokens: Tokens = {};
        if (this.rootApiKey) tokens.root = `Bearer ${this.rootApiKey}`;
        if (this.apiKey) tokens.api = `Bearer ${this.apiKey}`;

        return tokens;
    }

    private verifyTokens(tokens: Tokens, response: TokensResponse) {
        if (tokens.root && response.root === false)
            throw createCustomError(3000, "Invalid root token.");
        if (tokens.api && response.api === false)
            throw createCustomError(3000, "Invalid API token.");
    }

    // FUNCTIONS / Private.
    async isValidData(data: any) {
        return await PrivateAPI.isValidData(this.apiKey, data);
    }

    // FUNCTIONS / Public.
    async getPrayerTimes(data: any) {
        return await PublicAPI.getPrayerTimes(data);
    }

    async satinizer(data: any) {
        return await PublicAPI.satinizer(data);
    }

    async isValidPwd(data: any) {
        return await PublicAPI.isValidPwd(data);
    }

    async newURLEncrypt(data: any) {
        return await PublicAPI.newURLEncrypt(data);
    }
}

export { DymoAPI };
