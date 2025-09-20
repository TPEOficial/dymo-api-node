# Official Dymo API Library for Node.

You can see the library documentation by clicking [here](https://docs.tpeoficial.com/docs/dymo-api/getting-started/libraries?ch-pg=r-dm-node).

#### Installation

Use one of the following commands to install **Dymo API** in your `TS`/`JS` project.

```bash
npm i dymo-api

# or

pnpm i dymo-api

# or

yarn add dymo-api
```

#### Authenticating ourselves on the client with the API Key

[Get my free API Key](https://tpe.li/new-api-key?ch-pg=gh-dmapi-node-rd-step)

```ts
import DymoAPI from "dymo-api";

const dymoClient = new DymoAPI({
   // https://tpe.li/new-api-key
   apiKey: "PRIVATE_TOKEN_HERE" 
});

```

#### Validating all data at once

```ts
import DymoAPI from "dymo-api";

const dymoClient = new DymoAPI({
// https://tpe.li/new-api-key
   apiKey: "PRIVATE_TOKEN_HERE"
});

(async () => {
    const response = await dymoClient.isValidData({
        url: "https://test.com/test",
        email: "test@test.com", 
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
    })
})();
```

#### Validating Email with Rules

```ts
import DymoAPI from "dymo-api";

const dymoClient = new DymoAPI({
// https://tpe.li/new-api-key
   apiKey: "PRIVATE_TOKEN_HERE",
   rules: {
        email: {
            // These are the default rules defined for email validation.
            deny: ["FRAUD", "INVALID", "NO_MX_RECORDS", "NO_REPLY_EMAIL"]
        }
    }
});

(async () => {
    const decision = await dymoClient.isValidEmail("user@example.com");

    if (!decision.allow) throw new Error(`Email not allowed. Reason: ${decision.reasons[0]}`);
})();
```