import axios from "axios";
import config from "./config";

const customError = (code: number, message: string): Error => {
    const error = new Error();
    return Object.assign(error, { code, message: `[${config.lib.name}] ${message}` });
};

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

export const isValidData = async (token: string | null, data: Data): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    
    let i = false;
    for (const key in data) {
        if (data.hasOwnProperty(key) && (key === "email" || key === "phone" || key === "domain" || key === "creditCard" || key === "ip")) {
            i = true;
            break;
        }
    }
    if (!i) throw customError(1500, "You must provide at least one parameter.");
    
    try {
        const response = await axios.post("https://api.tpeoficial.com/v1/private/secure/verify", data, { headers: { "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.message);
    }
};