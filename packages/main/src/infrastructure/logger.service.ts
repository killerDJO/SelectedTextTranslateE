import * as winston from 'winston';
import { Format } from 'logform';
import { shell } from 'electron';
import { injectable } from 'inversify';
import * as path from 'path';

import { StorageFolderProvider } from '~/infrastructure/storage-folder-provider.service';
import { SettingsProvider } from '~/infrastructure/settings-provider.service';

@injectable()
export class Logger {
  private readonly logger: winston.Logger;
  private readonly transport: winston.transports.FileTransportInstance;
  private readonly logsDirectory: string;

  constructor(storageFolderProvider: StorageFolderProvider, settingsProvider: SettingsProvider) {
    const loggingSettings = settingsProvider.getSettings().value.logging;
    this.logsDirectory = path.join(storageFolderProvider.getPath(), 'logs');
    const logFilePath = path.join(this.logsDirectory, loggingSettings.logFileName);
    this.transport = new winston.transports.File({
      filename: logFilePath,
      maxsize: loggingSettings.maxLogSize
    });
    this.logger = winston.createLogger({
      format: this.getLogFormat(),
      transports: [this.transport]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: this.getLogFormat()
        })
      );
    }
  }

  public async openLogFolder(): Promise<void> {
    try {
      const error = await shell.openPath(this.logsDirectory);
      if (error) {
        this.warning(`Unable to open error log folder. ${error}`);
      }
    } catch (e) {
      this.error('Unable to open error log folder.', e);
    }
  }

  public async flush(): Promise<void> {
    const result = new Promise<void>(resolve => {
      this.logger.on('finish', () => {
        setImmediate(resolve);
      });
    });
    this.logger.end();
    return result;
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public warning(message: string): void {
    this.logger.warn(message);
  }

  public error(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const errorStack = error instanceof Error ? error.stack : '-';
    this.logger.error(`${message} | Error: "${errorMessage}" | Stack trace: "${errorStack}"`);
  }

  private getLogFormat(): Format {
    const recordFormat = winston.format.printf(info => {
      return `${info.timestamp}; ${info.level.toUpperCase()}; ${info.message}`;
    });
    return winston.format.combine(winston.format.timestamp(), recordFormat);
  }
}
