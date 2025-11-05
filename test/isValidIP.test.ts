/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});

describe("isValidIP", () => {
    it("Returns true for valid responseIP when rules allow it", async () => {
        const decision = await dymoRootClient.isValidIP("52.94.236.248");
        expect(decision.allow).toBe(true);
    });
});

describe("isValidIP", () => {
    it("Return that the IP is invalid", async () => {
        const decision = await dymoRootClient.isValidIP("56.248");
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("INVALID");
    });
});

const dymoFreeUserClient = new DymoAPI({
    apiKey: process.env.DYMO_TEST_API_KEY
});

describe("isValidIP", () => {
    it("Return that the IP is invalid", async () => {
        const decision = await dymoFreeUserClient.isValidIP("56.248", { deny: ["FRAUD", "INVALID"] });
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("INVALID");
    });
});

describe("isValidIP", () => {
    it("Fails for free users because it uses premium rules by default", async () => {
        await expect(
            dymoFreeUserClient.isValidIP("52.94.236.248")
        ).rejects.toThrow(/\[Dymo API\].*Upgrade your plan/);
    });
});

describe("isValidIP", () => {
    it("You must block the IP address because there is a rule that blocks your country", async () => {
        const decision = await dymoRootClient.isValidIP("91.213.28.7", { deny: ["COUNTRY:GB"] })
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("COUNTRY:GB");
    });
});