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