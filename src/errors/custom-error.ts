import config from "../config/config";

export function createCustomError (code: number, message: string): Error {
    const error = new Error();
    return Object.assign(error, {
        code,
        message: `[${config.lib.name}] ${message}`,
    });
};