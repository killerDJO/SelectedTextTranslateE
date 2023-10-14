import { injectable } from 'inversify';
import { dialog } from 'electron';

import { Logger } from '~/infrastructure/logger.service';

@injectable()
export class ErrorHandler {
  constructor(private readonly logger: Logger) {}

  public initialize(): void {
    process.on('uncaughtException', async err => {
      await this.handleError('Unhandled Error', err);
    });

    process.on('unhandledRejection', async reason => {
      await this.handleError(
        'Unhandled Promise Rejection',
        (reason as Error) || new Error('<no_error_available>')
      );
    });
  }

  private async handleError(title: string, error: Error): Promise<void> {
    console.debug('Handle Error', title, error);
    this.logger.error(title, error);
    this.logger.info('Application shutdown due to main process error.');
    await this.logger.flush();
    await this.openMessageBox();
    await this.logger.flush();
    process.exit(1);
  }

  private async openMessageBox(): Promise<void> {
    const messageBoxOptions: Electron.MessageBoxOptions = {
      type: 'error',
      title: 'Selected Text Translate is terminated.',
      message: 'Unexpected error has occurred. See error log for more details.',
      buttons: ['Open logs directory', 'Close']
    };
    const messageBoxReturnValue = await dialog.showMessageBox(messageBoxOptions);
    if (messageBoxReturnValue.response === 0) {
      await this.logger.openLogFolder();
    }
  }
}
