import { injectable } from "inversify";
import { BrowserWindow, } from "electron";
import * as path from "path";

import { Messages } from "common/messaging/Messages";
import { MessageBus } from "infrastructure/MessageBus";
import { Logger } from "infrastructure/Logger";
import { NotificationSender } from "infrastructure/NotificationSender";

@injectable()
export class ServiceRendererProvider {
    private serviceRenderer: BrowserWindow | null = null;

    constructor(
        private readonly logger: Logger,
        private readonly notificationSender: NotificationSender) {
    }

    public getServiceRenderer(): BrowserWindow {
        if (this.serviceRenderer === null) {
            this.serviceRenderer = new BrowserWindow({
                webPreferences: {
                    backgroundThrottling: false,
                    nodeIntegrationInWorker: true
                },
                show: false
            });
            this.serviceRenderer.loadURL(`file:${path.resolve(__dirname, "..\\service-renderer\\index.html")}`);

            const messageBus = new MessageBus(this.serviceRenderer);

            messageBus.observeCommand<string>(Messages.ServiceRenderer.LogInfo).subscribe(message => this.logger.info(message));
            messageBus.observeCommand<string>(Messages.ServiceRenderer.LogWarning).subscribe(message => this.logger.warning(message));
            messageBus.observeCommand<{ message: string; error: Error }>(Messages.ServiceRenderer.LogError).subscribe(({ message, error }) => {
                this.notificationSender.showNonCriticalError(`Error occurred in a service process: ${message}`, error);
            });
        }

        return this.serviceRenderer;
    }
}