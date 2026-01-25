import "dotenv/config";
import DymoAPI from "../../src/dymo-api";

const dymoRootClient = new DymoAPI({
    rootApiKey: process.env.DYMO_ROOT_TEST_API_KEY
});

const runAsyncTest = async () => {
    console.log("Running manual general tests...");

    console.log("Running isValidDataRaw...");
    console.log(await dymoRootClient.isValidDataRaw({
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
    }));

    console.log("Running isValidEmail...");
    console.log(await dymoRootClient.isValidEmail("test@example.com"));

    console.log("Running isValidIP...");
    console.log(await dymoRootClient.isValidIP("52.94.236.248"));
};

runAsyncTest();
