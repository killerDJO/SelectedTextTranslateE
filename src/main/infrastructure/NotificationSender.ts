import { Notification } from "electron";
import { injectable } from "inversify";

import { Logger } from "infrastructure/Logger";

@injectable()
export class NotificationSender {
    constructor(private readonly logger: Logger) {
    }

    public async send(title: string, message: string, clickHandler?: () => void): Promise<void> {
        if (!Notification.isSupported()) {
            return;
        }
        const notification = new Notification({
            title: title,
            body: message
        });

        return new Promise<void>((resolve) => {
            notification.on("show", (event) => resolve());

            if (!!clickHandler) {
                notification.on("click", clickHandler);
            }

            notification.show();
        });
    }

    public showNonCriticalError(message: string, error: Error): void {
        this.send(message, "Click to open error log to see details.", () => this.logger.openLogFolder());
        this.logger.error(`${message}`, error);
    }
}