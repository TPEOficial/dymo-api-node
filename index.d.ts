declare module "dymo-api" {
    interface ConfigurationOptions {
        rootApiKey?: string;
        apiKey?: string;
    }

    class DymoAPI {
        private configuration: ConfigurationOptions;
        constructor(configuration?: ConfigurationOptions);
        initializeTokens(): Promise<void>;
        isValidData(data: any): Promise<any>;
        getPrayerTimes(data: any): Promise<any>;
        inputSatinizer(data: any): Promise<any>;
        isValidPwd(data: any): Promise<any>;
        newURLEncrypt(data: any): Promise<any>;
    }

    export { DymoAPI, ConfigurationOptions };
}