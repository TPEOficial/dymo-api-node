import type * as React from "react";

export type PhoneData = {
    iso: any;
    phone: string;
} | string;

export interface CreditCardData {
    pan: string | number;
    expirationDate?: string;
    cvc?: string | number;
    cvv?: string | number;
};

export type VerifyPlugins = "blocklist" | "compromiseDetector" | "nsfw" | "reputation" | "torNetwork" | "typosquatting" | "urlShortener";

export interface Validator {
    email?: string;
    phone?: PhoneData;
    domain?: string;
    creditCard?: string | CreditCardData;
    ip?: string;
    wallet?: string;
    plugins?: VerifyPlugins[];
};

export interface SRNG {
    min: number;
    max: number;
    quantity?: number;
}

export type Attachment = {
    filename: string;
    path?: string;
    content?: string | Buffer;
    cid?: string;
};

export interface ServerEmailConfig {
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

export type SendEmail = {
    from: string;
    to: string;
    subject: string;
    attachments?: Attachment[];
    options?: {
        priority?: "high" | "normal" | "low";
        composeTailwindClasses?: boolean;
        compileToCssSafe?: boolean;
        onlyVerifiedEmails?: boolean;
    };
} & (
    { html: string; react?: never; } |
    { react: React.ReactNode; html?: never; }
);

export interface PrayerTimesData {
    lat?: number;
    lon?: number;
};

export interface InputSatinizerData {
    input?: string;
};

export interface IsValidPwdData {
    email?: string;
    password?: string;
    bannedWords?: string | string[];
    min?: number;
    max?: number;
};

export interface SRNComponent {
    integer: number;
    float: number;
}

export interface SRNSummary {
    values: SRNComponent[];
    executionTime: number;
}

export interface CountryPrayerTimes {
    country: string;
    prayerTimesByTimezone: {
        timezone: string;
        prayerTimes: {
            coordinates: string;
            date: string;
            calculationParameters: string;
            fajr: string;
            sunrise: string;
            dhuhr: string;
            asr: string;
            sunset: string;
            maghrib: string;
            isha: string;
        };
    }[];
};

export interface SatinizedInputAnalysis {
    input: string;
    formats: {
        ascii: boolean;
        bitcoinAddress: boolean;
        cLikeIdentifier: boolean;
        coordinates: boolean;
        crediCard: boolean;
        date: boolean;
        discordUsername: boolean;
        doi: boolean;
        domain: boolean;
        e164Phone: boolean;
        email: boolean;
        emoji: boolean;
        hanUnification: boolean;
        hashtag: boolean;
        hyphenWordBreak: boolean;
        ipv6: boolean;
        ip: boolean;
        jiraTicket: boolean;
        macAddress: boolean;
        name: boolean;
        number: boolean;
        panFromGstin: boolean;
        password: boolean;
        port: boolean;
        tel: boolean;
        text: boolean;
        semver: boolean;
        ssn: boolean;
        uuid: boolean;
        url: boolean;
        urlSlug: boolean;
        username: boolean;
    };
    includes: {
        spaces: boolean;
        hasSql: boolean;
        hasNoSql: boolean;
        letters: boolean;
        uppercase: boolean;
        lowercase: boolean;
        symbols: boolean;
        digits: boolean;
    };
}

export interface EmailStatus {
    status: boolean;
    error?: string;
}

export interface ValidationDetail {
    validation: string;
    message: string;
    word?: string;
}

export interface PasswordValidationResult {
    valid: boolean;
    password: string;
    details: ValidationDetail[];
}

export interface DataValidationAnalysis {
    email: {
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
            nsfw?: boolean;
            reputation?: "low" | "medium" | "high" | "very-high" | "education" | "governmental" | "unknown";
            torNetwork?: boolean;
            typosquatting?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
            urlShortener?: boolean;
        };
    };
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
            nsfw?: boolean;
            reputation?: "low" | "medium" | "high" | "very-high" | "education" | "governmental" | "unknown";
            torNetwork?: boolean;
            typosquatting?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
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
        };
    };
    wallet: {
        valid: boolean;
        fraud: boolean;
        wallet: string;
        type: "Bitcoin" | "Bitcoin (Bech32)" | "Ethereum" | "Litecoin" | "Cardano" | "Binance Smart Chain";
        plugins: {
            blocklist?: boolean;
            torNetwork?: boolean;
        };
    };
}
