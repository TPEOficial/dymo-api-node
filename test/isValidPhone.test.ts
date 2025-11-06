/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});

describe("isValidPhone", () => {
    it("Returns true for valid phone number when rules allow it", async () => {
        const decision = await dymoRootClient.isValidPhone("+34617509462");
        expect(decision.allow).toBe(true);
    });
});

describe("isValidPhone", () => {
    it("Return that the phone number is invalid", async () => {
        const decision = await dymoRootClient.isValidPhone("+test09462");
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("INVALID");
    });
});

const dymoFreeUserClient = new DymoAPI({
    apiKey: process.env.DYMO_TEST_API_KEY
});

describe("isValidPhone", () => {
    it("Return that the phone number is invalid", async () => {
        const decision = await dymoFreeUserClient.isValidPhone("+test09462", { deny: ["FRAUD", "INVALID"] });
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("INVALID");
    });
});

describe("isValidPhone", () => {
    it("It will return false because it is being blocked by a rule", async () => {
        const decision = await dymoRootClient.isValidPhone("+34617509462", { deny: ["COUNTRY:ES"]});
        expect(decision.allow).toBe(false);
    });
});