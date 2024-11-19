const DymoAPI = require("../dist/esm/dymo-api.js");

module.exports = dymo = new DymoAPI({
    //@ts-ignore
    rootApiKey: process.env.DYMO_ROOT_API_KEY,
    local: true
});