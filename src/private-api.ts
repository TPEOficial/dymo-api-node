import axios from "axios";
import { createCustomError } from "./errors/custom-error";

export const isValidData = async (token: string | null, data: Data): Promise<any> => {
    if (token === null) throw createCustomError(3000, "Invalid private token.");
    
    let i = false;
    for (const key in data) {
        if (data.hasOwnProperty(key) && (key === "email" || key === "tel" || key === "domain" || key === "creditCard" || key === "ip")) {
            i = true;
            break;
        }
    }
    if (!i) throw createCustomError(1500, "You must provide at least one parameter.");
    
    try {
        const response = await axios.post("https://api.tpeoficial.com/v1/private/secure/verify", data, {
            headers: { "Authorization": token },
        });
        return response.data;
    } catch (error: any) {
        throw createCustomError(5000, error.message);
    }
};