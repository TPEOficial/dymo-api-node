import pkg from "./lib/dymo-api.cjs";

const { DymoAPI: _DymoAPI } = pkg;

export { _DymoAPI as DymoAPI };

if (typeof module !== "undefined" && typeof module.exports !== "undefined") module.exports = { DymoAPI: _DymoAPI };