import type * as React from "react";

export interface PhoneData {
    iso: any;
    phone: string;
};

export interface CreditCardData {
    pan: string | number;
    expirationDate?: string;
    cvc?: string | number;
    cvv?: string | number;
};

export type VerifyPlugins = "compromiseDetector" | "nsfw" | "reputation" | "torNetwork" | "typosquatting" | "urlShortener";

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

export interface SendEmail {
    from: string;
    to: string;
    subject: string;
    html?: string;
    react?: never;
    options?: {
        priority?: "high" | "normal" | "low" | undefined;
        composeTailwindClasses?: boolean;
        compileToCssSafe?: boolean;
        onlyVerifiedEmails?: boolean;
    };
    attachments?: Attachment[];
}

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

export interface NewURLEncryptData {
    url?: string;
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
    country: String;
    prayerTimesByTimezone: {
        timezone: String;
        prayerTimes: {
            coordinates: String;
            date: String;
            calculationParameters: String;
            fajr: String;
            sunrise: String;
            dhuhr: String;
            asr: String;
            sunset: String;
            maghrib: String;
            isha: String;
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

export interface UrlResponse {
    original: string;
    code: string;
    encrypt: string;
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
        didYouMean: string | null,
        customTLD: boolean;
        domain: string;
        roleAccount: boolean;
        plugins: {};
    };
    phone: {
        valid: boolean;
        fraud: boolean;
        phone: string;
        prefix: string;
        number: string;
        country: string;
        countryCode: string;
        plugins: {};
    };
    domain: {
        valid: boolean;
        fraud: boolean;
        freeSubdomain: boolean;
        customTLD: boolean;
        domain: string;
        plugins: {};
    };
    creditCard: {
        valid: boolean;
        fraud: boolean;
        test: boolean;
        type: string;
        creditCard: string;
        plugins: {};
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
        lat: Number;
        lon: Number;
        timezone: string;
        offset: Number;
        currency: string;
        isp: string;
        org: string;
        as: string;
        asname: string;
        mobile: boolean;
        proxy: boolean;
        hosting: boolean;
        plugins: {};
    };
    wallet: {
        valid: boolean;
        fraud: boolean;
        wallet: string;
        type: "Bitcoin" | "Bitcoin (Bech32)" | "Ethereum" | "Litecoin" | "Cardano" | "Binance Smart Chain";
        plugins: {};
    };
}                             