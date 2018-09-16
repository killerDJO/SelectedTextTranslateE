import { injectable } from "inversify";
import { BrowserWindow } from "electron";
import * as path from "path";

@injectable()
export class ServiceRendererProvider {
    private serviceRenderer: BrowserWindow | null = null;

    public getServiceRenderer(): BrowserWindow {
        if (this.serviceRenderer === null) {
            this.serviceRenderer = new BrowserWindow({
                webPreferences: {
                    backgroundThrottling: false
                }
            });
            this.serviceRenderer.loadURL(`file:${path.resolve(__dirname, "..\\service-renderer\\index.html")}`);
            this.serviceRenderer.show();
        }

        return this.serviceRenderer;
    }
}