import axios from "axios";
//@ts-ignore
import { execSync } from "child_process";

const localVersion: string = execSync("npm list dymo-api --depth=0").toString().match(new RegExp("dymo-api@(\\d+\\.\\d+\\.\\d+)"))?.[1] || "0.0.0";

export async function checkForUpdates(): Promise<void> {
    try {
        const response = await axios.get<{ version: string }>("https://registry.npmjs.org/dymo-api/latest");
        const latestVersion: string = response.data.version;
        if (localVersion !== latestVersion) console.log(`[Dymo API] A new version of dymo-api is available: ${latestVersion}. You are using ${localVersion}. Consider updating.`);     
    } catch (error: any) {
        if (error.response) console.error("[Dymo API] Error fetching the latest version:", error.response.data);
        else if (error.request)  console.error("[Dymo API] No response received from the server:", error.request);
        else console.error("[Dymo API] An unknown error occurred:", error.message);
    }
};