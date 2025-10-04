/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});


describe("isValidEmail", () => {
    it("You should not accept the email because it does not have a Gravatar image", async () => {
        const decision = await dymoRootClient.isValidEmail("build-10-04-2025@test.com", { deny: ["NO_GRAVATAR"] })
        expect(decision.allow).toBe(false);
        expect(decision.reasons).toContain("NO_GRAVATAR");
    });
});