/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});

describe("isValidData", () => {
    it("Validate all data correctly", async () => {
        const response = await dymoRootClient.isValidData({
            url: "https://test.com/test",
            email: "admin@lamoncloa.gob.es",
            phone: "+34617509462",
            domain: "test.com",
            creditCard: {
                pan: "5110929780543845",
                expirationDate: "01/2030",
                cvv: "123"
            },
            ip: "52.94.236.248",
            wallet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
        });
        expect(response).toEqual({
            url: {
                valid: true,
                fraud: false,
                freeSubdomain: false,
                customTLD: false,
                url: "https://test.com/test",
                domain: "test.com",
                plugins: {}
            },
            email: {
                valid: true,
                fraud: false,
                proxiedEmail: false,
                freeSubdomain: false,
                corporate: true,
                email: "admin@lamoncloa.gob.es",
                realUser: "admin",
                didYouMean: null,
                noReply: false,
                customTLD: false,
                domain: "lamoncloa.gob.es",
                roleAccount: true,
                plugins: {}
            },
            phone: {
                valid: true,
                fraud: false,
                phone: "+34617509462",
                prefix: "34",
                number: "617509462",
                lineType: "Unknown",
                carrierInfo: {
                    carrierName: "Vodafone",
                    accuracy: 50,
                    carrierCountry: "Spain",
                    carrierCountryCode: "ES"
                },
                country: "Spain",
                countryCode: "ES",
                plugins: {}
            },
            domain: {
                valid: true,
                fraud: false,
                freeSubdomain: false,
                customTLD: false,
                domain: "test.com",
                plugins: {}
            },
            creditCard: {
                valid: true,
                fraud: false,
                test: false,
                type: "Mastercard",
                creditCard: "5110929780543845",
                plugins: {}
            },
            ip: {
                valid: true,
                type: "IPv4",
                class: "A",
                fraud: false,
                ip: "52.94.236.248",
                continent: "North America",
                continentCode: "NA",
                country: "United States",
                countryCode: "US",
                region: "VA",
                regionName: "Virginia",
                city: "Ashburn",
                district: "",
                zipCode: "20149",
                lat: 39.0438,
                lon: -77.4874,
                timezone: "America/New_York",
                offset: -18000,
                currency: "USD",
                isp: "Amazon.com, Inc.",
                org: "Amazon Technologies Inc. (us-east-1)",
                as: "AS16509 Amazon.com, Inc.",
                asname: "AMAZON-02",
                mobile: false,
                proxy: false,
                hosting: true,
                plugins: {}
            },
            wallet: {
                valid: true,
                fraud: false,
                wallet: "1a1zp1ep5qgefi2dmpttl5slmv7divfna",
                type: "Bitcoin",
                plugins: {}
            },
            userAgent: {
                valid: true,
                type: "browser",
                clientSlug: "chrome",
                clientName: "Chrome",
                version: "138.0.0.0",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                fraud: false,
                bot: false,
                info: "Chrome v138.0.0.0",
                os: "Windows 10.0",
                device: {
                    type: "Desktop",
                    brand: "Microsoft"
                },
                plugins: {}
            }
        });
    });
});

const dymoFreeUserClient = new DymoAPI({
    apiKey: process.env.DYMO_TEST_API_KEY
});

describe("isValidData", () => {
    it("It fails because plugins can only be used by premium users", async () => {
        await expect(
            dymoFreeUserClient.isValidData({
                url: "https://test.com/test",
                email: "build-09-20-2025@tpeoficial.com",
                phone: "+34617509462",
                domain: "test.com",
                creditCard: {
                    pan: "5110929780543845",
                    expirationDate: "01/2030",
                    cvv: "123"
                },
                ip: "52.94.236.248",
                wallet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                plugins: ["mxRecords"]
            })
        ).rejects.toThrow(/\[Dymo API\].*Upgrade your plan/);
    });
});