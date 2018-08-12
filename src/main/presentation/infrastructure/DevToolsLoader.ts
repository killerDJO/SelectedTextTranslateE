export class DevToolsLoader {
    public static async load(): Promise<void> {
        if (process.env.NODE_ENV === "development") {
            const devToolsInstaller = require("electron-devtools-installer");
            await devToolsInstaller.default(devToolsInstaller.VUEJS_DEVTOOLS);
        }
    }
}