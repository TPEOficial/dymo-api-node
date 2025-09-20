/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

describe("DymoAPI Rules behavior tests", () => {

    it("Should use default rules when none are provided", async () => {
        const client = new DymoAPI({ rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY });
        expect(client["rules"].email).toBeDefined();
        expect(client["rules"].sensitiveInfo).toBeDefined();
        expect(client["rules"].email!.deny!.length!).toBeGreaterThan(0);
        expect(client["rules"].sensitiveInfo!.deny!.length!).toBeGreaterThan(0);
    });

    it("Should override only email rules when provided", async () => {
        const client = new DymoAPI({
            rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
            rules: { email: { deny: ["FRAUD", "INVALID"] } }
        });

        expect(client["rules"].email!.deny).toEqual(["FRAUD", "INVALID"]);
        // sensitiveInfo should remain default.
        expect(client["rules"].sensitiveInfo!.deny).toEqual(["EMAIL", "PHONE", "CREDIT_CARD"]);
    });

    it("Should override only sensitiveInfo rules when provided", async () => {
        const client = new DymoAPI({
            rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
            rules: { sensitiveInfo: { deny: ["EMAIL", "URL"] } }
        });

        expect(client["rules"].sensitiveInfo!.deny).toEqual(["EMAIL", "URL"]);
        // email should remain default.
        expect(client["rules"].email!.deny).toEqual(["FRAUD", "INVALID", "NO_MX_RECORDS", "NO_REPLY_EMAIL"]);
    });

    it("Should override both email and sensitiveInfo rules when provided", async () => {
        const client = new DymoAPI({
            rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
            rules: {
                email: { deny: ["NO_MX_RECORDS"] },
                sensitiveInfo: { deny: ["IP", "WALLET"] }
            }
        });

        expect(client["rules"].email!.deny).toEqual(["NO_MX_RECORDS"]);
        expect(client["rules"].sensitiveInfo!.deny).toEqual(["IP", "WALLET"]);
    });

    it("Should handle empty deny arrays correctly", async () => {
        const client = new DymoAPI({
            rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
            rules: {
                email: { deny: [] },
                sensitiveInfo: { deny: [] }
            }
        });

        expect(client["rules"].email!.deny).toEqual([]);
        expect(client["rules"].sensitiveInfo!.deny).toEqual([]);
    });

    it("Should work with isValidEmail using partially overridden rules", async () => {
        const client = new DymoAPI({
            rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
            rules: { email: { deny: ["FRAUD"] } }
        });

        const decision = await client.isValidEmail("build-09-19-2025@tpeoficial.com");
        expect(decision.allow).toBe(true);
    });
});