import dotenv from "dotenv";
import DymoAPI from "../dymo-api.js";

dotenv.config();

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});

describe("isValidEmail", () => {
    it("Returns true for valid email when rules allow it", async () => {
        expect(await dymoRootClient.isValidEmail("build-09-19-2025@tpeoficial.com")).toBe(true);
    });
});

const dymoFreeUserClient = new DymoAPI({
    apiKey: process.env.DYMO_TEST_API_KEY
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
        expect(await dymoRootClient.isValidEmail("build-09-19-2025@test.com", { deny: ["NO_MX_RECORDS"] })).toBe(false);
    });
});