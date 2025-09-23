export type Email = `${string}@${string}` | string;

export type Phone = {
    iso: any;
    phone: string;
} | string;

export interface CreditCard {
    pan: string | number;
    expirationDate?: string;
    cvc?: string | number;
    cvv?: string | number;
}

export interface HTTPRequest {
    url: string;
    method: string | "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: string | object | null;
    [key: string]: any;
}