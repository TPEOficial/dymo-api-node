type GenericRequest<T = any> = {
    body?: T;
    headers?: Record<string, any>;
    ip?: string;
    connection?: { remoteAddress?: string };
    socket?: { remoteAddress?: string };
    req?: { socket?: { remoteAddress?: string; } };
};

// Helpers.
const getUserAgent = (req: GenericRequest): string | undefined => {
    return req.headers?.["user-agent"] || req.headers?.["User-Agent"];
};

const getIp = (req: GenericRequest): string | undefined => {
    return (
        req.ip ||
        req.headers?.["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.req?.socket?.remoteAddress
    );
};

export const handleRequest = <T = any>(req: GenericRequest<T>) => {
    return {
        body: req.body,
        userAgent: getUserAgent(req),
        ip: getIp(req)
    };
};