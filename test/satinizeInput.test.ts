/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoFreeUserClient = new DymoAPI();

describe("satinizeInput", () => {
    it("Sanitize the input entered correctly.", async () => {
        const result = await dymoFreeUserClient.satinize("12/03/2023");
        expect(result).toEqual({
            input: "12/03/2023",
            formats: {
                ascii: true,
                bitcoinAddress: false,
                cLikeIdentifier: false,
                coordinates: false,
                crediCard: false,
                date: true,
                discordUsername: false,
                doi: false,
                domain: false,
                e164Phone: false,
                email: false,
                emoji: true,
                hanUnification: false,
                hashtag: false,
                hyphenWordBreak: false,
                ipv6: false,
                ip: false,
                jiraTicket: false,
                macAddress: false,
                name: false,
                number: false,
                panFromGstin: false,
                password: true,
                port: false,
                tel: false,
                text: true,
                semver: false,
                ssn: false,
                uuid: false,
                url: false,
                urlSlug: false,
                username: true
            },
            includes: {
                spaces: false,
                hasSql: false,
                hasNoSql: false,
                letters: false,
                uppercase: false,
                lowercase: false,
                symbols: true,
                digits: true
            }
        })
    });
});