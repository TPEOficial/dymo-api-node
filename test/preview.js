
import { DymoAPI } from "../index.js";

// Creating the client for use.
const dymo = new DymoAPI({
    /*rootApiKey: "ROOT_TOKEN_HERE",
    apiKey: "PRIVATE_TOKEN_HERE",*/
});

/*
console.log(await dymo.isValidData({ email: "test@test.com", tel: "+34617509462", domain: "test.com", creditCard: "5110929780543845", ip: "52.94.236.248" })); // Private authorization required.
console.log(await dymo.getPrayerTimes({ lat: "37.3755847689721", lon: "-4.457957889422379" })); // No authorization required.
console.log(await dymo.inputSatinizer({ input: "21/08/2024" })); // No authorization required.
console.log(await dymo.isValidPwd({ email: "username@test.com", password: "ThisIsATest" })); // No authorization required.
console.log(await dymo.newURLEncrypt({ url: "https://www.tpeoficial.com/" })); // No authorization required.
*/