import axios from "axios";
import * as PublicAPI from "./branches/public";
import * as PrivateAPI from "./branches/private";
import config, { BASE_URL, setBaseUrl } from "./config";
import { checkForUpdates } from "./services/autoupdate";

const customError = (code: number, message: string): Error => {
    return Object.assign(new Error(), { code, message: `[${config.lib.name}] ${message}` });
};

interface TokensResponse {
    root: boolean;
    api: boolean;
};

interface Tokens {
    root?: string;
    api?: string;
};

interface ServerEmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    dkim?: {
        domainName: string;
        keySelector: string;
        privateKey: string;
    };
};

class DymoAPI {
    private rootApiKey: string | null;
    private apiKey: string | null;
    private tokensResponse: TokensResponse | null;
    private lastFetchTime: Date | null;
    private serverEmailConfig?: ServerEmailConfig;
    private local: boolean;

    constructor({ rootApiKey = null, apiKey = null, local = false, serverEmailConfig = undefined }: { rootApiKey?: string | null; apiKey?: string | null; local?: boolean; serverEmailConfig?: ServerEmailConfig; }) {
        this.rootApiKey = rootApiKey;
        this.apiKey = apiKey;
        this.tokensResponse = null;
        this.lastFetchTime = null;
        this.serverEmailConfig = serverEmailConfig;
        this.local = rootApiKey ? local : false; // Only allow setting local if rootApiKey is defined.
        setBaseUrl(this.local);
        this.autoupdate();
        this.initializeTokens(); // Calls the function to obtain tokens when creating the object.
    }

    private getBaseUrl(): string {
        return this.local ? "http://localhost:3050" : "https://api.tpeoficial.com";
    }

    private async getTokens(): Promise<TokensResponse | undefined> {
        const currentTime = new Date();
        if (this.tokensResponse && this.lastFetchTime && (currentTime.getTime() - this.lastFetchTime.getTime()) < 5 * 60 * 1000) {
            console.log(`[${config.lib.name}] Using cached tokens response.`);
            return this.tokensResponse;
        };

        const tokens: Tokens = {};
        if (this.rootApiKey) tokens.root = `Bearer ${this.rootApiKey}`;
        if (this.apiKey) tokens.api = `Bearer ${this.apiKey}`;

        try {
            if (Object.keys(tokens).length === 0) return;
            const response = await axios.post<TokensResponse>(`${BASE_URL}/v1/dvr/tokens`, { tokens });
            if (tokens.root && response.data.root === false) throw customError(3000, "Invalid root token.");
            if (tokens.api && response.data.api === false) throw customError(3000, "Invalid API token.");
            this.tokensResponse = response.data;
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

    private async autoupdate() {
        try {
            await checkForUpdates();
        } catch (error: any) {
            throw customError(5000, `Error checking the latest version in npmjs: ${error.message}`);
        }
    }


    // FUNCTIONS / Private.
    async isValidData(data: any): Promise<any> {
        return await PrivateAPI.isValidData(this.apiKey, data);
    }

    async sendEmail(data: any): Promise<any> {
        if (!this.serverEmailConfig) throw customError(5000, `You must configure the email client settings.`);
        return await PrivateAPI.sendEmail(this.apiKey, { serverEmailConfig: this.serverEmailConfig, ...data });
    }

    async getRandom(data: any): Promise<any> {
        return await PrivateAPI.getRandom(this.apiKey, data);
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

export default DymoAPI;