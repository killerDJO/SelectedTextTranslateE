import { Notification } from "electron";
import { injectable } from "inversify";
import { Logger } from "infrastructure/Logger";
import { Observable, empty } from "rxjs";

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

        return new Promise<void>((resolve, reject) => {
            notification.on("show", event => resolve());

            if (!!clickHandler) {
                notification.on("click", clickHandler);
            }

            notification.show();
        });
    }

    public showAndRethrowNonCriticalError<TResult>(message: string, error: Error, details: string = "[No details]"): Observable<TResult> {
        this.showAndRethrowNonCriticalError(message, error, details);
        throw error;
    }

    public showNonCriticalError<TResult>(message: string, error: Error, details: string = "[No details]"): void {
        this.send(message, "Click to open error log to see details.", () => this.logger.openLogFolder());
        this.logger.error(`${message} | ${details}`, error);
    }
}