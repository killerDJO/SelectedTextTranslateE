import { injectable } from "inversify";
import { Logger } from "infrastructure/Logger";
import { NotificationSender } from "infrastructure/NotificationSender";

@injectable()
export class RendererErrorHandler {
    constructor(private readonly logger: Logger, private readonly notificationSender: NotificationSender) {
    }

    public handlerError(viewName: string, error: Error): void {
        this.logger.error(`Renderer error has ocurred. View: ${viewName}`, error);
        this.notificationSender.send("Presentation error has ocurred.", "Application might be in the inconsistent state. Click to open error log to see details.", () => this.logger.openLogFolder());
    }
}