import axios from "axios";
import { execSync } from "child_process";

const localVersion: string = execSync(`npm list dymo-api --depth=0`).toString().match(new RegExp(`dymo-api@(\\d+\\.\\d+\\.\\d+)`))?.[1] || "0.0.0";

export async function checkForUpdates(): Promise<void> {
    try {
        const response = await axios.get<{ version: string }>(`https://registry.npmjs.org/dymo-api/latest`);
        const latestVersion: string = response.data.version;

        if (localVersion !== latestVersion) console.log(`A new version of dymo-api is available: ${latestVersion}. You are using ${localVersion}. Consider updating.`);
        else console.log(`You are using the latest version of dymo-api: ${localVersion}.`);
        
    } catch (error: any) {
        if (error.response) console.error("Error fetching the latest version:", error.response.data);
        else if (error.request)  console.error("No response received from the server:", error.request);
        else console.error("An unknown error occurred:", error.message);
    }
};