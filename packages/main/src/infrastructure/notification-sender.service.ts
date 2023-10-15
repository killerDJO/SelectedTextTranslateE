import { Notification } from 'electron';
import { injectable } from 'inversify';

import { Logger } from '~/infrastructure/logger.service';

@injectable()
export class NotificationSender {
  // Store current notification to prevent it from garbage collection
  private notification?: Notification;

  constructor(private readonly logger: Logger) {}

  public async send(title: string, message: string, clickHandler?: () => void): Promise<void> {
    if (!Notification.isSupported()) {
      return;
    }
    this.notification = new Notification({
      title: title,
      body: message
    });

    return new Promise<void>(resolve => {
      this.notification?.on('show', () => resolve());
      this.notification?.on('close', () => (this.notification = undefined));

      if (!!clickHandler) {
        this.notification?.on('click', clickHandler);
      }

      this.notification?.show();
    });
  }

  public showNonCriticalError(message: string, error: Error): void {
    this.send(message, 'Click to open error log to see details.', () =>
      this.logger.openLogFolder()
    );
    this.logger.error(`${message}`, error);
  }
}
