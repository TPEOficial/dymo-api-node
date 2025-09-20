import path from "path";
import React from "react";
import fs from "fs/promises";
import { twi } from "tw-to-css";
import { render } from "@react-email/render";
import config, { axiosApiUrl } from "../config";
import * as Interfaces from "../lib/types/interfaces";

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
 *               url, email, phone, domain, creditCard, ip, wallet or user agent.
 * 
 * @returns A promise that resolves to the response data from the verification endpoint.
 * 
 * @throws Will throw an error if the token is null, if none of the required fields are present in the data,
 *         or if an error occurs during the verification request.
 */
export const isValidData = async (token: string | null, data: Interfaces.Validator): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (!Object.keys(data).some((key) => ["url", "email", "phone", "domain", "creditCard", "ip", "wallet", "userAgent"].includes(key) && data.hasOwnProperty(key))) throw customError(1500, "You must provide at least one parameter.");
    try {
        const response = await axiosApiUrl.post("/private/secure/verify", data, { headers: { "Content-Type": "application/json", "Authorization": token } });
        return response.data;
    } catch (error: any) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = JSON.stringify(error.response?.data || {});
        throw customError(5000, `Error ${statusCode}: ${errorMessage}. Details: ${errorDetails}`);
    }
};

/**
 * Validates an email using a secure verification endpoint.
 *
 * @param {string | null} token - Authentication token (required).
 * @param {Interfaces.EmailValidator} email - Email to validate.
 * @param {Interfaces.EmailValidatorRules} [rules] - Deny rules. Defaults to ["FRAUD", "INVALID", "NO_MX_RECORDS", "NO_REPLY_EMAIL"].
 *
 * Deny rules (some are premium ⚠️):
 * - "FRAUD", "INVALID", "NO_MX_RECORDS" ⚠️, "PROXIED_EMAIL" ⚠️, "FREE_SUBDOMAIN" ⚠️,
 *   "PERSONAL_EMAIL", "CORPORATE_EMAIL", "NO_REPLY_EMAIL", "ROLE_ACCOUNT", "NO_REACHABLE", "HIGH_RISK_SCORE" ⚠️
 *
 * @returns {Promise<boolean>} True if the email passes all deny rules, false otherwise.
 * @throws Error if token is null, rules are empty, or request fails.
 *
 * @example
 * const valid = await isValidEmail(apiToken, "user@example.com", { deny: ["FRAUD", "NO_MX_RECORDS"] });
 */
export const isValidEmail = async (
    token: string | null,
    email: Interfaces.EmailValidator,
    rules: Interfaces.EmailValidatorRules
): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (rules.deny.length === 0) throw customError(1500, "You must provide at least one deny rule.");
    try {
        const responseEmail = (await axiosApiUrl.post("/private/secure/verify", {
            email,
            plugins: [
                rules.deny.includes("NO_MX_RECORDS") ? "mxRecords" : undefined,
                rules.deny.includes("NO_REACHABLE") ? "reachability" : undefined,
                rules.deny.includes("HIGH_RISK_SCORE") ? "riskScore" : undefined
            ]
        }, { headers: { "Content-Type": "application/json", "Authorization": token } })).data.email;

        let reasons: string[] = [];

        if (rules.deny.includes("INVALID") && !responseEmail.valid) reasons.push("INVALID");
        if (rules.deny.includes("FRAUD") && responseEmail.fraud) reasons.push("FRAUD");
        if (rules.deny.includes("PROXIED_EMAIL") && responseEmail.proxiedEmail) reasons.push("PROXIED_EMAIL");
        if (rules.deny.includes("FREE_SUBDOMAIN") && responseEmail.freeSubdomain) reasons.push("FREE_SUBDOMAIN");
        if (rules.deny.includes("PERSONAL_EMAIL") && !responseEmail.corporate) reasons.push("PERSONAL_EMAIL");
        if (rules.deny.includes("CORPORATE_EMAIL") && responseEmail.corporate) reasons.push("CORPORATE_EMAIL");
        if (rules.deny.includes("NO_MX_RECORDS") && responseEmail.plugins.mxRecords.length === 0) reasons.push("NO_MX_RECORDS");
        if (rules.deny.includes("NO_REPLY_EMAIL") && responseEmail.noReply) reasons.push("NO_REPLY_EMAIL");
        if (rules.deny.includes("ROLE_ACCOUNT") && responseEmail.plugins.roleAccount) reasons.push("ROLE_ACCOUNT");
        if (rules.deny.includes("NO_REACHABLE") && !responseEmail.plugins.reachable) reasons.push("NO_REACHABLE");
        if (rules.deny.includes("HIGH_RISK_SCORE") && responseEmail.plugins.riskScore >= 80) reasons.push("HIGH_RISK_SCORE");

        return {
            email: responseEmail.email,
            allow: reasons.length === 0,
            reasons,
            response: responseEmail
        };
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
export const sendEmail = async (token: string | null, data: Interfaces.SendEmail & { serverEmailConfig: Interfaces.ServerEmailConfig | undefined; }): Promise<any> => {
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
        const response = await axiosApiUrl.post("/private/sender/sendEmail", data, { headers: { "Authorization": token } });
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
        const response = await axiosApiUrl.post("/private/srng", data, { headers: { "Content-Type": "application/json", "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};


/**
 * Extracts structured data from a given string using a secure endpoint.
 * 
 * @param token - A string or null representing the authentication token. Must not be null.
 * @param data - An object adhering to the ExtractWithTextly interface, containing 'data' and 'format' fields.
 *               The 'data' field is the string from which structured data should be extracted.
 *               The 'format' field is an object defining the structure of the data to be extracted.
 * 
 * @returns A promise that resolves to the response data containing the extracted structured data.
 * 
 * @throws Will throw an error if the token is null, if 'data' or 'format' are not defined, 
 *         or if an error occurs during the request to the extraction endpoint.
 */
export const extractWithTextly = async (token: string | null, data: Interfaces.ExtractWithTextly): Promise<any> => {
    if (token === null) throw customError(3000, "Invalid private token.");
    if (!data.data) throw customError(1500, "No data provided.");
    if (!data.format) throw customError(1500, "No format provided.");
    try {
        const response = await axiosApiUrl.post("/private/textly/extract", data, { headers: { "Content-Type": "application/json", "Authorization": token } });
        return response.data;
    } catch (error: any) {
        throw customError(5000, error.response?.data?.message || error.message);
    }
};