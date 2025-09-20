import { MxRecord } from "dns";
import { Email, Phone, CreditCard } from "./primitives";

export type VerifyPlugins = "blocklist" | "compromiseDetector" | "mxRecords" | "nsfw" | "reputation" | "riskScore" | "torNetwork" | "typosquatting" | "urlShortener";
export type ReputationPlugin = "low" | "medium" | "high" | "very-high" | "education" | "governmental" | "unknown";
export type TyposquattingPlugin = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Validator {
    url?: string;
    email?: string;
    phone?: Phone;
    domain?: string;
    creditCard?: string | CreditCard;
    ip?: string;
    wallet?: string;
    userAgent?: string;
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
 * ⚠️ NO_MX_RECORDS, PROXIED_EMAIL, FREE_SUBDOMAIN, CORPORATE, and HIGH_RISK_SCORE are premium features.
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
    | "NO_REACHABLE"         // ⚠️ Premium
    | "HIGH_RISK_SCORE";     // ⚠️ Premium

// ------------ SENSITIVE INFO VALIDATOR ------------ //
export type NegativeSensitiveInfoRules = "EMAIL" | "PHONE" | "CREDIT_CARD" | "URL" | "DOMAIN" | "IP" | "WALLET" | "USER_AGENT";

// -------------------- OUPUT -------------------- //

// ------------ EMAIL VALIDATOR ------------ //
export type EmailValidatorResponse = {
    email: string;
    allow: boolean;
    reasons: NegativeEmailRules[];
    response: DataEmailValidationAnalysis;
};

// ------------ SENSITIVE INFO VALIDATOR ------------ //
export type SensitiveInfoResponse = {
    input: string;
    allow: boolean;
    reasons: NegativeSensitiveInfoRules[];
};

interface DataEmailValidationAnalysis {
    valid: boolean;
    fraud: boolean;
    proxiedEmail: boolean;
    freeSubdomain: boolean;
    corporate: boolean;
    email: string;
    realUser: string;
    didYouMean: string | null;
    noReply: boolean;
    customTLD: boolean;
    domain: string;
    roleAccount: boolean;
    plugins: {
        blocklist?: boolean;
        compromiseDetector?: boolean;
        mxRecords: MxRecord[];
        nsfw?: boolean;
        reputation?: TyposquattingPlugin;
        riskScore?: number;
        torNetwork?: boolean;
        typosquatting?: TyposquattingPlugin;
        urlShortener?: boolean;
    };
}

export interface DataValidationAnalysis {
    url: {
        valid: boolean;
        fraud: boolean;
        freeSubdomain: boolean;
        customTLD: boolean;
        url: string;
        domain: string;
        plugins: {
            blocklist?: boolean;
            compromiseDetector?: boolean;
            mxRecords: MxRecord[];
            nsfw?: boolean;
            reputation?: ReputationPlugin;
            riskScore?: number;
            torNetwork?: boolean;
            typosquatting?: TyposquattingPlugin;
            urlShortener?: boolean;
        };
    };
    email: DataEmailValidationAnalysis;
    phone: {
        valid: boolean;
        fraud: boolean;
        phone: string;
        prefix: string;
        number: string;
        lineType: "PREMIUM_RATE" | "TOLL_FREE" | "SHARED_COST" | "VOIP" | "PERSONAL_NUMBER" | "PAGER" | "UAN" | "VOICEMAIL" | "FIXED_LINE_OR_MOBILE" | "FIXED_LINE" | "MOBILE" | "Unknown";
        carrierInfo: {
            carrierName: string;
            accuracy: number;
            carrierCountry: string;
            carrierCountryCode: string;
        };
        country: string;
        countryCode: string;
        plugins: {
            blocklist?: boolean;
            riskScore?: number;
        };
    };
    domain: {
        valid: boolean;
        fraud: boolean;
        freeSubdomain: boolean;
        customTLD: boolean;
        domain: string;
        plugins: {
            blocklist?: boolean;
            compromiseDetector?: boolean;
            mxRecords: MxRecord[];
            nsfw?: boolean;
            reputation?: "low" | "medium" | "high" | "very-high" | "education" | "governmental" | "unknown";
            riskScore?: number;
            torNetwork?: boolean;
            typosquatting?: TyposquattingPlugin;
            urlShortener?: boolean;
        };
    };
    creditCard: {
        valid: boolean;
        fraud: boolean;
        test: boolean;
        type: string;
        creditCard: string;
        plugins: {
            blocklist?: boolean;
            riskScore?: number;
        };
    };
    ip: {
        valid: boolean;
        type: "IPv4" | "IPv6" | "Invalid";
        class: "A" | "B" | "C" | "D" | "E" | "Unknown" | "None";
        fraud: boolean;
        ip: string;
        continent: string;
        continentCode: string;
        country: string;
        countryCode: string;
        region: string;
        regionName: string;
        city: string;
        district: string;
        zipCode: string;
        lat: number;
        lon: number;
        timezone: string;
        offset: number;
        currency: string;
        isp: string;
        org: string;
        as: string;
        asname: string;
        mobile: boolean;
        proxy: boolean;
        hosting: boolean;
        plugins: {
            blocklist?: boolean;
            riskScore?: number;
        };
    };
    wallet: {
        valid: boolean;
        fraud: boolean;
        wallet: string;
        type: string;
        plugins: {
            blocklist?: boolean;
            riskScore?: number;
            torNetwork?: boolean;
        };
    };
    userAgent: {
        valid: boolean;
        type?: string;
        clientSlug?: string | null;
        clientName?: string;
        version?: string | null;
        userAgent?: string;
        fraud?: boolean;
        bot?: boolean;
        info?: string;
        os?: string;
        device: {
            type?: string;
            brand?: string;
        };
        plugins?: {
            blocklist?: boolean;
            riskScore?: number;
        };
    };
}