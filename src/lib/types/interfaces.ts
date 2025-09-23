import type * as React from "react";

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

export type SchemaType = "string" | "number" | "boolean" | "array" | "object";

export interface JsonSchemaProperty {
    type: SchemaType;
    items?: JsonSchemaProperty;
    properties?: Record<string, JsonSchemaProperty>;
    required?: string[];
    description?: string;
    format?: string;
    enum?: unknown[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    [key: string]: unknown;
}

export interface ExtractWithTextly {
    data: string;
    format: {
        [key: string]: JsonSchemaProperty;
    };
}

export * from "./rules";
export * from "./primitives";
export * from "./data-verifier";
export * from "./well-known-bots";