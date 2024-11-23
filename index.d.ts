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
}

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
        private local: boolean;
        constructor(configuration?: ConfigurationOptions);
        initializeTokens(): Promise<void>;
        isValidData(data: any): Promise<any>;
        getRandom(data: any): Promise<any>;
        getPrayerTimes(data: any): Promise<any>;
        inputSatinizer(data: any): Promise<any>;
        isValidPwd(data: any): Promise<any>;
        newURLEncrypt(data: any): Promise<any>;
        sendEmail(data: any): Promise<any>;
    }

    export default DymoAPI;
}