export type Email = `${string}@${string}` | string;

export type Phone = {

    /** The country code of the phone number. */
    iso: any;

    /** The phone number. */
    phone: string;
} | string;


export interface CreditCard {

    /** The credit card number. */
    pan: string | number;

    /** The expiration date of the credit card. */
    expirationDate?: string;

    /** The security code of the credit card. */
    cvc?: string | number;

    /** The security code of the credit card. */
    cvv?: string | number;
}

export interface HTTPRequest {

    /** The URL to make the request to. */
    url: string;

    /** The HTTP method to use. */
    method: string | "GET" | "POST" | "PUT" | "DELETE";

    /** The headers to include in the request. */
    headers?: Record<string, string>;

    /** The body of the request. */
    body?: string | object | null;

    [key: string]: any;
}