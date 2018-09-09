import * as path from "path";
import * as fs from "fs";

export function readJsonFile(fileName: string): any {
    const defaultSettingsPath = path.resolve(__dirname, fileName);
    const defaultSettingsContent = fs.readFileSync(defaultSettingsPath).toString("utf8");
    return JSON.parse(defaultSettingsContent);
}