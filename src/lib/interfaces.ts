import type * as React from "react";

interface PhoneData {
    iso: any;
    phone: string;
};

interface CreditCardData {
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