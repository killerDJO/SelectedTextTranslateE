import { Environment } from "infrastructure/Environment";

export class DevToolsLoader {
    public static async load(): Promise<void> {
        if (Environment.isDevelopment()) {
            const devToolsInstaller = require("electron-devtools-installer");
            await devToolsInstaller.default(devToolsInstaller.VUEJS_DEVTOOLS);
        }
    }
}