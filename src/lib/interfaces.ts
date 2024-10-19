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

export interface Validator {
    email?: string;
    phone?: PhoneData;
    domain?: string;
    creditCard?: string | CreditCardData;
    ip?: string;
    wallet?: string;
};

export interface SRNG {
    min: number;
    max: number;
    quantity?: number;
}

export type SendEmail = | { from: string; to: string; subject: string; html: string; react?: never } | { from: string; to: string; subject: string; html?: never; react: React.ReactNode };