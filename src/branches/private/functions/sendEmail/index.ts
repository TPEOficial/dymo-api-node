import path from "path";
import React from "react";
import fs from "fs/promises";
import { twi } from "tw-to-css";
import { type AxiosInstance } from "axios";
import { render } from "@react-email/render";
import { customError } from "@/utils/basics";
import * as Interfaces from "@/lib/types/interfaces";
import { ResilienceManager } from "@/lib/resilience";
import { FallbackDataGenerator } from "@/lib/resilience/fallback";

interface SendEmailParams {
    axiosClient: AxiosInstance;
    resilienceManager?: ResilienceManager;
    data: Interfaces.SendEmail & { serverEmailConfig: Interfaces.ServerEmailConfig | undefined; };
}

const convertTailwindToInlineCss = (htmlContent: string): string => {
    return htmlContent.replace(/class="([^"]+)"( style="([^"]+)")?/g, (match, classList, _, existingStyle) => {
        const compiledStyles = twi(classList, { minify: true, merge: true });
        return match.replace(/class="[^"]+"/, "").replace(/ style="[^"]+"/, "").concat(` style="${existingStyle ? `${existingStyle.trim().slice(0, -1)}; ${compiledStyles}` : compiledStyles}"`);
    });
};

/**
 * Sends an email using a secure sending endpoint.
 */
export const sendEmail = async ({
    axiosClient,
    resilienceManager,
    data
}: SendEmailParams): Promise<Interfaces.EmailStatus> => {
    if (!axiosClient.defaults.headers?.Authorization) throw customError(3000, "Invalid private token.");
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

    // Process attachments
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

    if (resilienceManager) {
        const fallbackData = FallbackDataGenerator.generateFallbackData<Interfaces.EmailStatus>("sendEmail", data);
        return await resilienceManager.executeWithResilience<Interfaces.EmailStatus>(
            axiosClient,
            {
                method: "POST",
                url: "/private/sender/sendEmail",
                data
            },
            resilienceManager.getConfig().fallbackEnabled ? fallbackData : undefined
        );
    } else {
        const response = await axiosClient.post("/private/sender/sendEmail", data);
        return response.data;
    }
};
