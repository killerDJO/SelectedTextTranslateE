import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

export class DevToolsLoader {
    public static async load(): Promise<void> {
        if (process.env.NODE_ENV === "dev") {
            await installExtension(VUEJS_DEVTOOLS);
        }
    }
}