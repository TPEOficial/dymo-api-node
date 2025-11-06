import { MxRecord } from "dns";
import { Email, Phone, CreditCard, Char } from "./primitives";

export type VerifyPlugins = "blocklist" | "gravatar" | "compromiseDetector" | "mxRecords" | "nsfw" | "reputation" | "riskScore" | "torNetwork" | "typosquatting" | "urlShortener";
export type ReputationPlugin = "low" | "medium" | "high" | "very-high" | "education" | "governmental" | "unknown";
export type TyposquattingPlugin = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Validator {
    /** 
     * URL to validate. Example: `https://dymo.tpeoficial.com`.
     * Validation includes checking for fraud, free subdomains, custom TLDs, and optional plugins.
     */
    url?: string;

    /** 
     * Email address to validate. Example: `test@tpeoficial.com`.
     * Validation checks format, MX records, proxy usage, personal vs corporate, role accounts, and fraud risk.
     */
    email?: Email;

    /** 
     * Phone object to validate, includes country code and number.
     * Validation detects line type, carrier info, country, fraud risk, and optional plugins.
     */
    phone?: Phone;

    /** 
     * Domain name to validate. Example: `tpe.li`.
     * Validation includes checking for fraud, free subdomains, custom TLDs, and optional plugins like blocklist or typosquatting.
     */
    domain?: string;

    /** 
     * Credit card number or object to validate.
     * Checks for fraud, test cards, card type, and optional blocklist or risk score plugins.
     */
    creditCard?: CreditCard;

    /** 
     * IP address to validate. Example: `192.168.0.1`.
     * Validation includes type (IPv4/IPv6), class (A-E), geolocation, proxy/hosting detection, fraud, and plugins.
     */
    ip?: string;

    /** 
     * Cryptocurrency wallet address to validate.
     * Checks include fraud detection, wallet type, and optional plugins like risk score or Tor network.
     */
    wallet?: string;

    /** 
     * User-Agent string to validate.
     * Validation detects client type, bot detection, fraud, OS/device info, and optional plugins.
     */
    userAgent?: string;

    /** 
     * IBAN number to validate.
     * Validation checks structure, country, bank info, fraud, and optional plugins like blocklist or risk score.
     */
    iban?: string;

    /** 
     * Optional plugins to extend validation.
     * Available plugins: `"blocklist" | "compromiseDetector" | "mxRecords" | "nsfw" | "reputation" | "riskScore" | "torNetwork" | "typosquatting" | "urlShortener"`.
     */
    plugins?: VerifyPlugins[];
}

// -------------------- INPUT -------------------- //

// ------------ EMAIL VALIDATOR ------------ //
export type EmailValidator = Email;
/**
 * @typedef {"FRAUD"|"INVALID"|"NO_MX_RECORDS"|"PROXIED_EMAIL"|"FREE_SUBDOMAIN"|"PERSONAL"|"CORPORATE"|"NO_REPLY"|"ROLE_ACCOUNT"|"REACHABLE"|"HIGH_RISK_SCORE"} NegativeEmailRules
 *
 * @description
 * Values indicating why an email is considered negative.
 * ⚠️ NO_MX_RECORDS, PROXIED_EMAIL, FREE_SUBDOMAIN, CORPORATE, NO_GRAVATAR, and HIGH_RISK_SCORE are premium features.
 */
export type NegativeEmailRules =
    | "FRAUD"
    | "INVALID"
    | "NO_MX_RECORDS"        // ⚠️ Premium
    | "PROXIED_EMAIL"
    | "FREE_SUBDOMAIN"
    | "PERSONAL_EMAIL"
    | "CORPORATE_EMAIL"
    | "NO_REPLY_EMAIL"
    | "ROLE_ACCOUNT"
    | "NO_GRAVATAR"          // ⚠️ Premium
    | "NO_REACHABLE"         // ⚠️ Premium
    | "HIGH_RISK_SCORE";     // ⚠️ Premium

// ------------ IP VALIDATOR ------------ //
export type IPValidator = string;
/**
 * @typedef {"FRAUD"|"INVALID"|"HIGH_RISK_SCORE"} NegativeIPRules
 *
 * @description
 * Values indicating why an IP is considered negative.
 * ⚠️ TOR_NETWORK and HIGH_RISK_SCORE are premium features.
 */
export type NegativeIPRules =
    | "FRAUD"
    | "INVALID"
    | "TOR_NETWORK"        // ⚠️ Premium
    | "HIGH_RISK_SCORE"    // ⚠️ Premium
    | `COUNTRY:${Char}${Char}`; // Two-char country code.

// ------------ PHONE VALIDATOR ------------ //
export type PhoneValidator = Phone;
/**
 * @typedef {"FRAUD"|"INVALID"|"HIGH_RISK_SCORE"} NegativePhoneRules
 * ⚠️ HIGH_RISK_SCORE is a premium feature.
 * @description
 * Values indicating why an phone is considered negative.
 */
export type NegativePhoneRules =
    | "FRAUD"
    | "INVALID"
    | "HIGH_RISK_SCORE"     // ⚠️ Premium
    | `COUNTRY:${Char}${Char}`; // Two-char country code.

// ------------ SENSITIVE INFO VALIDATOR ------------ //
export type NegativeSensitiveInfoRules = "EMAIL" | "PHONE" | "CREDIT_CARD" | "URL" | "DOMAIN" | "IP" | "WALLET" | "USER_AGENT";

// -------------------- OUPUT -------------------- //

// ------------ EMAIL VALIDATOR ------------ //

/**
 * Response returned by the email validator.
 */
export type EmailValidatorResponse = {
    /** The validated email address. */
    email: string;

    /** Whether the email is allowed (not blocked/fraudulent). */
    allow: boolean;

    /** List of rules indicating why the email may be considered negative. */
    reasons: NegativeEmailRules[];

    /** Detailed analysis of the email validation result. */
    response: DataEmailValidationAnalysis;
};

// ------------ IP VALIDATOR ------------ //

/**
 * Response returned by the email validator.
 */
export type IPValidatorResponse = {
    /** The validated email address. */
    ip: string;

    /** Whether the email is allowed (not blocked/fraudulent). */
    allow: boolean;

    /** List of rules indicating why the email may be considered negative. */
    reasons: NegativeIPRules[];

    /** Detailed analysis of the email validation result. */
    response: DataIPValidationAnalysis;
};

// ------------ PHONE VALIDATOR ------------ //

/**
 * Response returned by the phone validator.
 */
export type PhoneValidatorResponse = {
    /** The validated phone number. */
    phone: string;

    /** Whether the email is allowed (not blocked/fraudulent). */
    allow: boolean;

    /** List of rules indicating why the email may be considered negative. */
    reasons: NegativePhoneRules[];

    /** Detailed analysis of the email validation result. */
    response: DataPhoneValidationAnalysis;
};

// ------------ SENSITIVE INFO VALIDATOR ------------ //

/**
 * Response returned by the sensitive info validator.
 */
export type SensitiveInfoResponse = {
    /** Input string being validated (email, phone, etc.). */
    input: string;

    /** Whether the input is allowed (not blocked/fraudulent). */
    allow: boolean;

    /** List of rules indicating why the input may be considered negative. */
    reasons: NegativeSensitiveInfoRules[];
};

/**
 * Detailed analysis of an email validation.
 */
export interface DataEmailValidationAnalysis {
    /** Whether the email is valid. */
    valid: boolean;

    /** Whether the email is flagged as fraudulent. */
    fraud: boolean;

    /** Whether the email is using a proxied email service. */
    proxiedEmail: boolean;

    /** Whether the email belongs to a free subdomain. */
    freeSubdomain: boolean;

    /** Whether the email is corporate. */
    corporate: boolean;

    /** The email being analyzed. */
    email: string;

    /** The real user associated with the email, if known. */
    realUser: string;

    /** Suggested correction for typos, if any. */
    didYouMean: string | null;

    /** Whether the email is a no-reply address. */
    noReply: boolean;

    /** Whether the email uses a custom TLD. */
    customTLD: boolean;

    /** Domain part of the email. */
    domain: string;

    /** Whether the email is a role account (admin, support, etc.). */
    roleAccount: boolean;

    /** Results from optional validation plugins. */
    plugins: {
        /** Whether the email is blocked by a blocklist. */
        blocklist?: boolean;

        /** Gravatar URL for the email. */
        gravatarUrl?: string;

        /** Whether the email is flagged as a compromise. */
        compromiseDetector?: boolean;

        /** MX records for the email domain. */
        mxRecords: MxRecord[];

        /** Whether the email is flagged as NSFW. */
        nsfw?: boolean;

        /** Reputation plugin results. */
        reputation?: TyposquattingPlugin;

        /** Risk score for the email. */
        riskScore?: number;

        /** Whether the email is in a Tor network. */
        torNetwork?: boolean;

        /** Typosquatting plugin results. */
        typosquatting?: TyposquattingPlugin;

        /** Whether the email is a URL shortener. */
        urlShortener?: boolean;
    };
}

/**
 * Detailed analysis of an IP validation.
 */
export interface DataIPValidationAnalysis {

    /** Whether the IP address is valid. */
    valid: boolean;

    /** The type of IP address. */
    type: "IPv4" | "IPv6" | "Invalid";

    /** The IP class for the IP address. */
    class: "A" | "B" | "C" | "D" | "E" | "Unknown" | "None";

    /** Whether the IP address is fraudulent. */
    fraud: boolean;

    /** The IP address being analyzed. */
    ip: string;

    /** The continent for the IP address. */
    continent: string;

    /** The continent code for the IP address. */
    continentCode: string;

    /** The country for the IP address. */
    country: string;

    /** The country code for the IP address. */
    countryCode: string;

    /** The region code for the IP address. */
    region: string;

    /** The region name for the IP address. */
    regionName: string;

    /** The city for the IP address. */
    city: string;

    /** The district for the IP address. */
    district: string;

    /** The postal code for the IP address. */
    zipCode: string;

    /** The latitude for the IP address. */
    lat: number;

    /** The longitude for the IP address. */
    lon: number;

    /** The timezone for the IP address. */
    timezone: string;

    /** The timezone offset for the IP address. */
    offset: number;

    /** The currency for the IP address. */
    currency: string;

    /** The ISP for the IP address. */
    isp: string;

    /** The organization for the IP address. */
    org: string;

    /** The AS number for the IP address. */
    as: string;

    /** The AS name for the IP address. */
    asname: string;

    /** Whether the IP address is a mobile device. */
    mobile: boolean;

    /** Whether the IP address is a proxy. */
    proxy: boolean;

    /** Whether the IP address is hosting a website. */
    hosting: boolean;

    /** Results from optional validation plugins. */
    plugins: {

        /** Whether the IP address is blocked by a blocklist. */
        blocklist ?: boolean;

        /** The risk score for the IP address. */
        riskScore ?: number;
    };
}

/**
 * Detailed analysis of an phone validation.
 */
export interface DataPhoneValidationAnalysis {
    /** Whether the phone number is valid. */
    valid: boolean;

    /** Whether the phone number is fraudulent. */
    fraud: boolean;

    /** The phone number being analyzed. */
    phone: string;

    /** The country code for the phone number. */
    prefix: string;

    /** The line type for the phone number. */
    number: string;

    /** The line type for the phone number. */
    lineType: "PREMIUM_RATE" | "TOLL_FREE" | "SHARED_COST" | "VOIP" | "PERSONAL_NUMBER" | "PAGER" | "UAN" | "VOICEMAIL" | "FIXED_LINE_OR_MOBILE" | "FIXED_LINE" | "MOBILE" | "Unknown";

    /** The carrier information for the phone number. */
    carrierInfo: {

        /** The carrier name for the phone number. */
        carrierName: string;

        /** The accuracy of the carrier information. */
        accuracy: number;

        /** The carrier country for the phone number. */
        carrierCountry: string;

        /** The carrier country code for the phone number. */
        carrierCountryCode: string;
    };

    /** The country for the phone number. */
    country: string;

    /** The country code for the phone number. */
    countryCode: string;

    /** Results from optional validation plugins. */
    plugins: {

        /** Whether the phone number is blocked by a blocklist. */
        blocklist?: boolean;

        /** The risk score for the phone number. */
        riskScore?: number;
    };
}

export interface DataValidationAnalysis {
    /** URL validation result. */
    url: {

        /** Whether the URL is valid. */
        valid: boolean;

        /** Whether the URL is fraudulent. */
        fraud: boolean;

        /** Whether the URL has a free subdomain. */
        freeSubdomain: boolean;

        /** Whether the URL uses a custom TLD. */
        customTLD: boolean;

        /** The URL being analyzed. */
        url: string;

        /** Domain part of the URL. */
        domain: string;

        /** Results from optional validation plugins. */
        plugins: {

            /** Whether the URL is blocked by a blocklist. */
            blocklist?: boolean;

            /** Whether the URL is flagged as a compromise. */
            compromiseDetector?: boolean;

            /** MX records for the URL domain. */
            mxRecords: MxRecord[];

            /** Whether the URL is flagged as NSFW. */
            nsfw?: boolean;

            /** Reputation plugin results. */
            reputation?: ReputationPlugin;

            /** Risk score for the URL. */
            riskScore?: number;

            /** Whether the URL is in a Tor network. */
            torNetwork?: boolean;

            /** Typosquatting plugin results. */
            typosquatting?: TyposquattingPlugin;

            /** Whether the URL is a URL shortener. */
            urlShortener?: boolean;
        };
    };

    /** Email validation result. */
    email: DataEmailValidationAnalysis;

    /** Phone validation result. */
    phone: DataPhoneValidationAnalysis;

    /** Domain validation result. */
    domain: {

        /** Whether the domain is valid. */
        valid: boolean;

        /** Whether the domain is fraudulent. */
        fraud: boolean;

        /** Whether the domain has a free subdomain. */
        freeSubdomain: boolean;

        /** Whether the domain uses a custom TLD. */
        customTLD: boolean;

        /** The domain being analyzed. */
        domain: string;

        /** Results from optional validation plugins. */
        plugins: {

            /** Whether the domain is blocked by a blocklist. */
            blocklist?: boolean;

            /** Whether the domain is flagged as a compromise. */
            compromiseDetector?: boolean;

            /** MX records for the domain. */
            mxRecords: MxRecord[];

            /** Whether the domain is flagged as NSFW. */
            nsfw?: boolean;

            /** Reputation plugin results. */
            reputation?: "low" | "medium" | "high" | "very-high" | "education" | "governmental" | "unknown";
            
            /** Risk score for the domain. */
            riskScore?: number;

            /** Whether the domain is in a Tor network. */
            torNetwork?: boolean;

            /** Typosquatting plugin results. */
            typosquatting?: TyposquattingPlugin;

            /** Whether the domain is a URL shortener. */
            urlShortener?: boolean;
        };
    };

    /** Credit card validation result. */
    creditCard: {

        /** Whether the credit card number is valid. */
        valid: boolean;

        /** Whether the credit card number is fraudulent. */
        fraud: boolean;

        /** Whether the credit card number is a test card. */
        test: boolean;

        /** The type of credit card. */
        type: string;

        /** The credit card number being analyzed. */
        creditCard: string;

        /** Results from optional validation plugins. */
        plugins: {

            /** Whether the credit card number is blocked by a blocklist. */
            blocklist?: boolean;

            /** The risk score for the credit card number. */
            riskScore?: number;
        };
    };

    /** IP validation result. */
    ip: DataIPValidationAnalysis;

    /** Wallet validation result. */
    wallet: {

        /** Whether the wallet is valid. */
        valid: boolean;

        /** Whether the wallet is fraudulent. */
        fraud: boolean;

        /** The wallet being analyzed. */
        wallet: string;

        /** The type of wallet. */
        type: string;

        /** Results from optional validation plugins. */
        plugins: {

            /** Whether the wallet is blocked by a blocklist. */
            blocklist?: boolean;

            /** The risk score for the wallet. */
            riskScore?: number;

            /** Whether the wallet is in a Tor network. */
            torNetwork?: boolean;
        };
    };

    /** User-Agent validation result. */
    userAgent: {

        /** Whether the User-Agent is valid. */
        valid: boolean;

        /** The type of User-Agent. */
        type?: string;

        /** The slug of the User-Agent. */
        clientSlug?: string | null;

        /** The name of the User-Agent. */
        clientName?: string;

        /** The version of the User-Agent. */
        version?: string | null;

        /** The User-Agent being analyzed. */
        userAgent?: string;

        /** Whether the User-Agent is fraudulent. */
        fraud?: boolean;

        /** Whether the User-Agent is a bot. */
        bot?: boolean;

        /** The browser for the User-Agent. */
        info?: string;

        /** The operating system for the User-Agent. */
        os?: string;

        /** The device for the User-Agent. */
        device: {

            /** The type of device. */
            type?: string;

            /** The brand of the device. */
            brand?: string;
        };

        /** Results from optional validation plugins. */
        plugins?: {

            /** Whether the User-Agent is blocked by a blocklist. */
            blocklist?: boolean;

            /** The risk score for the User-Agent. */
            riskScore?: number;
        };
    };

    /** IBAN validation result. */
    iban: {

        /** Whether the IBAN is valid. */
        valid: boolean;

        /** Whether the IBAN is fraudulent. */
        fraud?: boolean;

        /** The IBAN being analyzed. */
        iban?: string;

        /** The BBAN for the IBAN. */
        bban?: string;

        /** The BIC for the IBAN. */
        bic?: string | "unknown";

        /** The country for the IBAN. */
        country?: string;

        /** The country code for the IBAN. */
        countryCode?: string;

        /** The account number for the IBAN. */
        accountNumber?: string;

        /** The branch identifier for the IBAN. */
        branchIdentifier?: string;

        /** The bank identifier for the IBAN. */
        bankIdentifier?: string;

        /** Results from optional validation plugins. */
        plugins?: {

            /** Whether the IBAN is blocked by a blocklist. */
            blocklist?: boolean;

            /** The risk score for the IBAN. */
            riskScore?: number;
        };
    };
}