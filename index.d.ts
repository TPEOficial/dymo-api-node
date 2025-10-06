export interface ConfigurationOptions {
    rootApiKey?: string;
    apiKey?: string;
    local?: boolean;
    serverEmailConfig?: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    rules?: {
        email: {
            mode: Mode;
            deny: string[];
        };
        phone: {
            mode: Mode;
            deny: string[];
        };
        sensitiveInfo: {
            mode: Mode;
            deny: string[];
        };
        waf: {
            mode: Mode;
            allowBots: string[];
            deny: string[];
        };
    };
}

type Mode = "LIVE" | "DRY_RUN";

//@ts-ignore
declare module "dymo-api" {
    class DymoAPI {
        private rootApiKey: string | null;
        private apiKey: string | null;
        private tokensResponse: { root: boolean; api: boolean; } | null;
        private lastFetchTime: Date | null;
        private serverEmailConfig?: {
            host: string;
            port: number;
            secure: boolean;
            auth: {
                user: string;
                pass: string;
            };
        };
        private rules?: {
            email: {
                mode: Mode;
                deny: string[];
            };
            phone: {
                mode: Mode;
                deny: string[];
            };
            sensitiveInfo: {
                mode: Mode;
                deny: string[];
            };
            waf: {
                mode: Mode;
                allowBots: string[];
                deny: string[];
            };
        };
        private local: boolean;
        constructor(configuration?: ConfigurationOptions);
        initializeTokens(): Promise<void>;

        // Data Validation.
        isValidData(data: any): Promise<any>;
        isValidDataRaw(data: any): Promise<any>;
        isValidEmail(data: any): Promise<any>;

        // Data Protection.
        protectReq(data: any): Promise<any>;

        getRandom(data: any): Promise<any>;
        extractWithTextly(data: any): Promise<any>;
        getPrayerTimes(data: any): Promise<any>;
        inputSatinizer(data: any): Promise<any>;
        isValidPwd(data: any): Promise<any>;
        newURLEncrypt(data: any): Promise<any>;
        sendEmail(data: any): Promise<any>;
    }

    export default DymoAPI;
}