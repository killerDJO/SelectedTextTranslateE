import { injectable } from 'inversify';

import { Logger } from '~/infrastructure/Logger';
import { NotificationSender } from '~/infrastructure/NotificationSender';

@injectable()
export class RendererErrorHandler {
  constructor(
    private readonly logger: Logger,
    private readonly notificationSender: NotificationSender
  ) {}

  public handleError(viewName: string, error: Error, message?: string): void {
    this.logger.error(
      `Renderer error has ocurred. ${message ?? '<no-message>'}. View: ${viewName}`,
      error
    );
    this.notificationSender.send(
      message ?? 'Presentation error has ocurred.',
      'Click to open error log to see details.',
      () => this.logger.openLogFolder()
    );
  }
}
