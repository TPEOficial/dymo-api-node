/// <reference types="jest" />

import DymoAPI from "../src/dymo-api.js";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY,
    rules: {
        bot: {
            allow: ["CATEGORY:SEARCH_ENGINE", "CURL", "NMAP"]
        }
    }
});