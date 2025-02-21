import path from "path";
import axios from "axios";
import React from "react";
import fs from "fs/promises";
import { twi } from "tw-to-css";
import config, { BASE_URL } from "../config";
import { render } from "@react-email/render";
import * as Interfaces from "../lib/interfaces";

const customError = (code: number, message: string): Error => {
    return Object.assign(new Error(), { code, message: `[${config.lib.name}] ${message}` });
};

const convertTailwindToInlineCss = (htmlContent: string): string => {
    return htmlContent.replace(/class="([^"]+)"( style="([^"]+)")?/g, (match, classList, _, existingStyle) => {
        const compiledStyles = twi(classList, { minify: true, merge: true });
        return match.replace(/class="[^"]+"/, "").replace(/ style="[^"]+"/, "").concat(` style="${existingStyle ? `${existingStyle.trim().slice(0, -1)}; ${compiledStyles}` : compiledStyles}"`);
    });
};

/**
 * Validates the provided data using a secure verification endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the Validator interface, containing at least one of the following fields: 
 *               email, phone, domain, creditCard, ip, or wallet.
 * 
 * @returns A promise that resolves to the response data from the verification endpoint.
 * 
 * @throws Will throw an error if the token is null, if none of the required fields are present in the data,
 *         or if an error occurs during the verification request.
 */
export const isValidData = async (token: string | null, data: Interfaces.Validator): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (!Object.keys(data).some((key) => ["email", "phone", "domain", "creditCard", "ip", "wallet"].includes(key) && data.hasOwnProperty(key))) throw customError(1500, "You must provide at least one parameter.");
    try {
        const response = await axios.post(`${BASE_URL}/v1/private/secure/verify`, data, { headers: { "Authorization": token } });
        return response.data;
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};

/**
 * Sends an email using a secure sending endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the SendEmail interface, containing the following fields: 
 *               'from', 'to', 'subject', 'html' or 'react', and optionally 'attachments', 'options', 'priority', 'waitToResponse', and 'composeTailwindClasses'.
 * 
 * @returns A promise that resolves to the response data from the sending endpoint.
 * 
 * @throws Will throw an error if the token is null, if any of the required fields are missing, 
 *         if the 'react' field is not a valid React element, if the 'attachments' field exceeds the maximum allowed size of 40 MB, 
 *         or if an error occurs during the sending request.
 */
export const sendEmail = async (token: string | null, data: Interfaces.SendEmail & { serverEmailConfig: Interfaces.ServerEmailConfig | undefined }): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (!data.from) throw customError(1500, "You must provide an email address from which the following will be sent.");
    if (!data.to) throw customError(1500, "You must provide an email to be sent to.");
    if (!data.subject) throw customError(1500, "You must provide a subject for the email to be sent.");
    if (!data.html && !data.react && !React.isValidElement(data.react)) throw customError(1500, "You must provide HTML or a React component.");
    if (data.html && data.react) throw customError(1500, "You must provide only HTML or a React component, not both.");
    try {
        if (data.react) {
            //@ts-ignore
            data.html = await render(data.react as React.ReactElement);
            delete data.react;
        }
        if (data.options && data.options.composeTailwindClasses) {
            data.html = convertTailwindToInlineCss(data.html as string);
            delete data.options.composeTailwindClasses;
        }
    } catch (error) {
        throw customError(1500, `An error occurred while rendering your React component. Details: ${error}`);
    }
    try {
        let totalSize = 0;
        if (data.attachments && Array.isArray(data.attachments)) {
            const processedAttachments = await Promise.all(
                data.attachments.map(async (attachment) => {
                    if ((attachment.path && attachment.content) || (!attachment.path && !attachment.content)) throw customError(1500, "You must provide either 'path' or 'content', not both.");
                    let contentBuffer;
                    if (attachment.path) contentBuffer = await fs.readFile(path.resolve(attachment.path));
                    else if (attachment.content) contentBuffer = attachment.content instanceof Buffer ? attachment.content : Buffer.from(attachment.content);
                    totalSize += Buffer.byteLength(contentBuffer!);
                    if (totalSize > 40 * 1024 * 1024) throw customError(1500, "Attachments exceed the maximum allowed size of 40 MB.");
                    return {
                        filename: attachment.filename || path.basename(attachment.path || ""),
                        content: contentBuffer,
                        cid: attachment.cid || attachment.filename
                    } as Interfaces.Attachment;
                })
            );
            data.attachments = processedAttachments;
        }
        const response = await axios.post(`${BASE_URL}/v1/private/sender/sendEmail`, data, { headers: { "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};

/**
 * Retrieves a random number within a specified range using a secure endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the SRNG interface, containing 'min' and 'max' fields, 
 *               which define the inclusive range within which the random number should be generated.
 * 
 * @returns A promise that resolves to the response data containing the random number.
 * 
 * @throws Will throw an error if the token is null, if 'min' or 'max' are not defined, 
 *         if 'min' is not less than 'max', if 'min' or 'max' are out of the allowed range,
 *         or if an error occurs during the request to the random number generator endpoint.
 */
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