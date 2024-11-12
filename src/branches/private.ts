import axios from "axios";
import config, { BASE_URL } from "../config"; 
import { render } from "@react-email/render";
import * as Interfaces from "../lib/interfaces";

const customError = (code: number, message: string): Error => {
    return Object.assign(new Error(), { code, message: `[${config.lib.name}] ${message}` });
};

export const isValidData = async (token: string | null, data: Interfaces.Validator): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    let i = false;
    for (const key in data) {
        if (data.hasOwnProperty(key) && (key === "email" || key === "phone" || key === "domain" || key === "creditCard" || key === "ip" || key === "wallet")) {
            i = true;
            break;
        }
    }
    if (!i) throw customError(1500, "You must provide at least one parameter.");
    try {
        const response = await axios.post(`${BASE_URL}/v1/private/secure/verify`, data, { headers: { "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};

export const sendEmail = async (token: string | null, data: Interfaces.SendEmail): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (!data.from) throw customError(1500, "You must provide an email address from which the following will be sent.");
    if (!data.to) throw customError(1500, "You must provide an email to be sent to.");
    if (!data.subject) throw customError(1500, "You must provide a subject for the email to be sent.");
    if (!data.html && !data.react) throw customError(1500, "You must provide HTML or a React component.");
    if (data.html && data.react) throw customError(1500, "You must provide only HTML or a React component, not both.");
    try {
        if (data.react) {
            //@ts-ignore
            data.html = await render(data.react as React.ReactElement);
            delete data.react;
        }
    } catch (error) {
        throw customError(1500, `An error occurred while rendering your React component. Details: ${error}`);
    }
    try {
        const response = await axios.post(`${BASE_URL}/v1/private/sender/sendEmail`, data, { headers: { "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};

export const getRandom = async (token: string | null, data: Interfaces.SRNG): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (!data.min || !data.max) throw customError(1500, "Both 'min' and 'max' parameters must be defined.");
    if (data.min >= data.max) throw customError(1500, "'min' must be less than 'max'.");
    if (data.min < -1000000000 || data.min > 1000000000) throw customError(1500, "'min' must be an integer in the interval [-1000000000}, 1000000000].");
    if (data.max < -1000000000 || data.max > 1000000000) throw customError(1500, "'max' must be an integer in the interval [-1000000000}, 1000000000].");
    try {
        const response = await axios.post(`${BASE_URL}/v1/private/srng`, data, { headers: { "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};