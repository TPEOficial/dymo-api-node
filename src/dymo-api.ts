import config, { setBaseUrl } from "./config";
import * as Interfaces from "./lib/interfaces";
import * as PublicAPI from "./branches/public";
import * as PrivateAPI from "./branches/private";

const customError = (code: number, message: string): Error => {
    return Object.assign(new Error(), { code, message: `[${config.lib.name}] ${message}` });
};

class DymoAPI {
    private rootApiKey: string | null;
    private apiKey: string | null;
    private serverEmailConfig?: Interfaces.ServerEmailConfig;
    private baseUrl: string;

    /**
     * @param {Object} options - Options to create the DymoAPI instance.
     * @param {string} [options.rootApiKey] - The root API key.
     * @param {string} [options.apiKey] - The API key.
     * @param {string} [options.baseUrl] - Whether to use a local server instead of the cloud server.
     * @param {Object} [options.serverEmailConfig] - The server email config.
     * @description
     * This is the main class to interact with the Dymo API. It should be
     * instantiated with the root API key and the API key. The root API key is
     * used to fetch the tokens and the API key is used to authenticate the
     * requests.
     * @example
     * const dymoApi = new DymoAPI({
     *     rootApiKey: "6bfb7675-6b69-4f8d-9f43-5a6f7f02c6c5",
     *     apiKey: "4c8b7675-6b69-4f8d-9f43-5a6f7f02c6c5"
     * });
     */
    constructor(
        {
            rootApiKey = null,
            apiKey = null,
            baseUrl = "https://api.tpeoficial.com",
            serverEmailConfig = undefined
        }: {
            rootApiKey?: string | null;
            apiKey?: string | null;
            baseUrl?: string;
            serverEmailConfig?: Interfaces.ServerEmailConfig;
        } = {}) {
        this.rootApiKey = rootApiKey;
        this.apiKey = apiKey;
        this.serverEmailConfig = serverEmailConfig;
        this.baseUrl = baseUrl;
        setBaseUrl(baseUrl);
    }

    // FUNCTIONS / Private.
    /**
     * Validates the given data against the configured validation settings.
     *
     * This method requires either the root API key or the API key to be set.
     * If neither is set, it will throw an error.
     *
     * @param {Object} data - The data to be validated.
     * @param {string} [data.url] - Optional URL to be validated.
     * @param {string} [data.email] - Optional email address to be validated.
     * @param {Interfaces.PhoneData} [data.phone] - Optional phone number data to be validated.
     * @param {string} [data.domain] - Optional domain name to be validated.
     * @param {string|Interfaces.CreditCardData} [data.creditCard] - Optional credit card number or data to be validated.
     * @param {string} [data.ip] - Optional IP address to be validated.
     * @param {string} [data.wallet] - Optional wallet address to be validated.
     * @param {Interfaces.VerifyPlugins[]} [data.plugins] - Optional array of verification plugins to be used.
     * @returns {Promise<Interfaces.DataValidationAnalysis>} A promise that resolves to the response from the server.
     * @throws Will throw an error if there is an issue with the validation process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/private/data-verifier)
     */
    async isValidData(data: Interfaces.Validator): Promise<Interfaces.DataValidationAnalysis> {
        return await PrivateAPI.isValidData(this.rootApiKey || this.apiKey, data);
    }

    /**
     * Sends an email using the configured email client settings.
     *
     * This method requires either the root API key or the server email config to be set.
     * If neither is set, it will throw an error.
     *
     * @param {Object} data - The email data to be sent.
     * @param {string} data.from - The email address from which the email will be sent.
     * @param {string} data.to - The email address to which the email will be sent.
     * @param {string} data.subject - The subject of the email.
     * @param {string} [data.html] - The HTML content of the email.
     * @param {React.ReactElement} [data.react] - The React component to be rendered as the email content.
     * @param {Object} [data.options] - Content configuration options.
     * @param {"high" | "normal" | "low" | undefined} [data.options.priority="normal"] - Email priority (default: normal).
     * @param {boolean} [data.options.waitToResponse=true] - Wait until the email is sent (default: true).
     * @param {boolean} [data.options.composeTailwindClasses] - Whether to compose tailwind classes.
     * @param {Attachment[]} [data.attachments] - An array of attachments to be included in the email.
     * @param {string} data.attachments[].filename - The name of the attached file.
     * @param {string} [data.attachments[].path] - The path or URL of the attached file. Either this or `content` must be provided.
     * @param {Buffer} [data.attachments[].content] - The content of the attached file as a Buffer. Either this or `path` must be provided.
     * @param {string} [data.attachments[].cid] - The CID (Content-ID) of the attached file, used for inline images.
     * @returns {Promise<Interfaces.EmailStatus>} A promise that resolves to the response from the server.
     * @throws Will throw an error if there is an issue with the email sending process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/private/sender-send-email/getting-started)
     */
    async sendEmail(data: Interfaces.SendEmail): Promise<Interfaces.EmailStatus> {
        if (!this.serverEmailConfig && !this.rootApiKey) console.error(`[${config.lib.name}] You must configure the email client settings.`);
        return await PrivateAPI.sendEmail(this.rootApiKey || this.apiKey, { serverEmailConfig: this.serverEmailConfig, ...data });
    }

    /**
     * Generates a random number between the provided min and max values.
     *
     * This method requires either the root API key or the API key to be set.
     * If neither is set, it will throw an error.
     *
     * @param {Interfaces.SRNG} data - The data to be sent.
     * @param {number} data.min - The minimum value of the range.
     * @param {number} data.max - The maximum value of the range.
     * @param {number} [data.quantity] - The number of random values to generate. Defaults to 1 if not provided.
     * @returns {Promise<Interfaces.SRNSummary>} A promise that resolves to the response from the server.
     * @throws Will throw an error if there is an issue with the random number generation process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/private/secure-random-number-generator)
     */
    async getRandom(data: Interfaces.SRNG): Promise<Interfaces.SRNSummary> {
        return await PrivateAPI.getRandom(this.rootApiKey || this.apiKey, data);
    }

    
    /**
     * Extracts structured data from a given string using Textly.
     *
     * This method requires either the root API key or the API key to be set.
     * If neither is set, it will throw an error.
     *
     * @param {Interfaces.ExtractWithTextly} data - The data to be sent, containing the string to be processed and the format schema.
     * @returns {Promise<any>} A promise that resolves to the extracted structured data.
     * @throws Will throw an error if there is an issue with the extraction process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/private/textly/text-extraction)
     */
    async extractWithTextly(data: Interfaces.ExtractWithTextly): Promise<any> {
        return await PrivateAPI.extractWithTextly(this.rootApiKey || this.apiKey, data);
    }

    // FUNCTIONS / Public.
    /**
     * Retrieves the prayer times for the given location.
     *
     * This method requires a latitude and longitude to be provided in the
     * data object. If either of these are not provided, it will throw an error.
     *
     * @param {Object} data - The data to be sent.
     * @param {number} data.lat - The latitude of the location.
     * @param {number} data.lon - The longitude of the location.
     * @returns {Promise<Interfaces.CountryPrayerTimes | { error: string }>} A promise that resolves to the response from the server.
     * @throws Will throw an error if there is an issue with the prayer times retrieval process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/public/prayertimes)
     */
    async getPrayerTimes(data: Interfaces.PrayerTimesData): Promise<Interfaces.CountryPrayerTimes | { error: string }> {
        return await PublicAPI.getPrayerTimes(data);
    }

    /**
     * Satinizes the input, replacing any special characters with their HTML
     * entities.
     *
     * @param {Object} data - The data to be sent.
     * @param {string} data.input - The input to be satinized.
     * @returns {Promise<Interfaces.SatinizedInputAnalysis>} A promise that resolves to the response from the server.
     * @throws Will throw an error if there is an issue with the satinization process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/public/input-satinizer)
     */
    async satinizer(data: Interfaces.InputSatinizerData): Promise<Interfaces.SatinizedInputAnalysis> {
        return await PublicAPI.satinizer(data);
    }

    /**
     * Validates a password based on the given parameters.
     *
     * This method requires the password to be provided in the data object.
     * If the password is not provided, it will throw an error. The method
     * will validate the password against the following rules:
     *  - The password must be at least 8 characters long.
     *  - The password must be at most 32 characters long.
     *  - The password must contain at least one uppercase letter.
     *  - The password must contain at least one lowercase letter.
     *  - The password must contain at least one number.
     *  - The password must contain at least one special character.
     *  - The password must not contain any of the given banned words.
     *
     * @param {Object} data - The data to be sent.
     * @param {number} [data.min] - Minimum length of the password. Defaults to 8 if not provided.
     * @param {number} [data.max] - Maximum length of the password. Defaults to 32 if not provided.
     * @param {string} [data.email] - Optional email associated with the password.
     * @param {string} data.password - The password to be validated.
     * @param {string | string[]} [data.bannedWords] - The list of banned words that the password must not contain.
     * @returns {Promise<Interfaces.PasswordValidationResult>} A promise that resolves to the response from the server.
     * @throws Will throw an error if there is an issue with the password validation process.
     *
     * [Documentation](https://docs.tpeoficial.com/docs/dymo-api/public/password-validator)
     */
    async isValidPwd(data: Interfaces.IsValidPwdData): Promise<Interfaces.PasswordValidationResult> {
        return await PublicAPI.isValidPwd(data);
    }
}

export default DymoAPI;