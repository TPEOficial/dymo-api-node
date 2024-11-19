
const { dymo } = require("./client");
const { readdirSync } = require("fs");
const { join, extname, resolve } = require("path");

(async () => {
    try {
        const directoryPath = resolve(process.cwd(), "./test/unit-tests");
        for (const file of readdirSync(directoryPath)) {
            if (extname(file) === ".js") {
                try {
                    const module = require(join(directoryPath, file));
                    if (typeof module.main === "function") {
                        console.log(`Executing main() in ${file}`);
                        await module.main(dymo);
                    } else console.warn(`No main() function found in ${file}`);
                } catch (err) {
                    console.error(`Error importing or executing main() in ${file}:`, err);
                }
            }
        }
    } catch (err) {
        console.error("Error reading directory:", err);
    }
})();