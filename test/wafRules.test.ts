/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    baseUrl: "http://localhost:3050",
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
    rules: {
        waf: {
            allowBots: ["CATEGORY:SEARCH_ENGINE", "CURL", "NMAP"]
        }
    }
});

describe("WafRules", () => {
    it("You should let the request go through without any problems", async () => {
        const exampleNextRequest = {
            method: "GET",
            url: "https://example.com/path?foo=bar",
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
                "accept": "text/html",
                "x-forwarded-for": "123.45.67.89",
                "host": "example.com",
                "accept-language": "en-US,en;q=0.9",
                "cookie": "session=abc123"
            },
            nextUrl: {
                href: "https://example.com/path?foo=bar",
                pathname: "/path",
                search: "?foo=bar",
                searchParams: new URLSearchParams("foo=bar")
            },
            cookies: {
                session: "abc123"
            },
            ip: "123.45.67.89",
            body: null,
            geo: {
                country: "US",
                region: "CA",
                city: "San Francisco"
            },
            cf: {
                connectingIp: "123.45.67.89",
                country: "US",
                region: "CA",
                city: "San Francisco"
            }
        };
        const decision = await dymoRootClient.protectReq(exampleNextRequest);

        try {
            expect(decision.allow).toBe(true);
        } catch (err) {
            console.log("Decision reasons:", JSON.stringify(decision.reasons));
            throw err;
        }
    });
});

describe("WafRules", () => {
    it("Block the request because the user agent is not defined as allowed", async () => {
        const exampleCurlRequest = {
            method: "GET",
            url: "https://example.com/path?foo=bar",
            headers: {
                "user-agent": "curl/7.85.0",
                "accept": "*/*",
                "x-forwarded-for": "123.45.67.89",
                "host": "example.com",
                "cookie": "session=abc123"
            },
            nextUrl: {
                href: "https://example.com/path?foo=bar",
                pathname: "/path",
                search: "?foo=bar",
                searchParams: new URLSearchParams("foo=bar")
            },
            cookies: {
                session: "abc123"
            },
            ip: "123.45.67.89",
            body: null,
            geo: {
                country: "US",
                region: "CA",
                city: "San Francisco"
            },
            cf: {
                connectingIp: "123.45.67.89",
                country: "US",
                region: "CA",
                city: "San Francisco"
            }
        };
        const decision = await dymoRootClient.protectReq(exampleCurlRequest, { allowBots: [] });
        expect(decision.allow).toBe(false);
    });
});