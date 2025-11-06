export type Email = `${string}@${string}.${string}` | string;

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type Char = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" |
    "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" |
    "U" | "V" | "W" | "X" | "Y" | "Z";

export type Phone = {

    /** The country code of the phone number. */
    iso: any;

    /** The phone number. */
    phone: string;
} | `+${string}` | string;

type CvcString = `${Digit}${Digit}${Digit}` | string | number;

export type CreditCard = {

    /** The credit card number. */
    pan: string | number;

    /** The expiration date of the credit card. */
    expirationDate?: string;

    /** The security code of the credit card. */
    cvc?: CvcString;

    /** The security code of the credit card. */
    cvv?: CvcString;
} | string;

export interface HTTPRequest {

    /** The URL to make the request to. */
    url: string;

    /** The HTTP method to use. */
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string;

    /** The headers to include in the request. */
    headers?: Record<string, string>;

    /** The body of the request. */
    body?: string | object | null;

    [key: string]: any;
}