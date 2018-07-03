import { Notification } from "electron";
import { injectable } from "inversify";

@injectable()
export class NotificationSender {
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
}