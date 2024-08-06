interface TokensResponse {
    root: boolean;
    api: boolean;
}

interface Tokens {
    root?: string;
    api?: string;
}

interface DymoAPIConstructorOptions {
    rootApiKey?: string | null;
    apiKey?: string | null;
}

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

interface Data {
    email?: string;
    phone?: PhoneData;
    domain?: string;
    creditCard?: string | CreditCardData;
    ip?: string;
};

interface PrayerTimesData {
    lat?: number;
    lon?: number;
}

interface InputSatinizerData {
    input?: string;
}

interface IsValidPwdData {
    email?: string;
    password?: string;
    bannedWords?: string | string[];
    min?: number;
    max?: number;
}

interface NewURLEncryptData {
    url?: string;
}
