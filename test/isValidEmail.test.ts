/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});

describe("isValidEmail", () => {
    it("Returns true for valid email when rules allow it", async () => {
        const decision = await dymoRootClient.isValidEmail("build-09-19-2025@tpeoficial.com");
        expect(decision.allow).toBe(true);
    });
});

describe("isValidEmail", () => {
    it("Return that the email is invalid", async () => {
        const decision = await dymoRootClient.isValidEmail("build-09-24-2025");
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("INVALID");
    });
});

const dymoFreeUserClient = new DymoAPI({
    apiKey: process.env.DYMO_TEST_API_KEY
});

describe("isValidEmail", () => {
    it("Return that the email is invalid", async () => {
        const decision = await dymoFreeUserClient.isValidEmail("build-09-30-2025", { deny: ["FRAUD", "INVALID", "NO_REPLY_EMAIL"] });
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("INVALID");
    });
});

describe("isValidEmail", () => {
    it("Fails for free users because it uses premium rules by default", async () => {
        await expect(
            dymoFreeUserClient.isValidEmail("build-09-19-2025@tpeoficial.com")
        ).rejects.toThrow(/\[Dymo API\].*Upgrade your plan/);
    });
});


describe("isValidEmail", () => {
    it("You should check because test.com is a domain reserved for testing without MX records", async () => {
        const decision = await dymoRootClient.isValidEmail("build-09-19-2025@test.com", { deny: ["NO_MX_RECORDS"] })
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("NO_MX_RECORDS");
    });
});