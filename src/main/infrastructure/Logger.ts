import * as winston from "winston";
import { Format } from "logform";
import { shell } from "electron";
import { injectable } from "inversify";
import * as path from "path";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { SettingsStore } from "infrastructure/SettingsStore";

@injectable()
export class Logger {
    private readonly logger: winston.Logger;
    private readonly transport: winston.transports.FileTransportInstance;
    private readonly logsDirectory: string;

    constructor(storageFolderProvider: StorageFolderProvider, settingsStore: SettingsStore) {
        const loggingSettings = settingsStore.getSettings().logging;
        this.logsDirectory = path.join(storageFolderProvider.getPath(), "logs");
        const logFilePath = path.join(this.logsDirectory, loggingSettings.logFileName);
        this.transport = new winston.transports.File({ filename: logFilePath, maxsize: loggingSettings.maxLogSize  });
        this.logger = winston.createLogger({
            format: this.getLogFormat(),
            transports: [
                this.transport
            ]
        });

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
              format: this.getLogFormat(),
            }));
          }
    }

    public openLogFolder(): void {
        try {
            shell.openPath(this.logsDirectory);
        } catch (e) {
            this.error("Unable to open error log folder.", e);
        }
    }

    public async flush(): Promise<void> {
        const result = new Promise<void>((resolve) => {
            this.logger.on("finish", () => {
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

    public error(message: string, error: Error): void {
        this.logger.error(`${message} | Error: "${error.message}" | Stack trace: "${error.stack}"`);
    }

    private getLogFormat(): Format {
        const recordFormat = winston.format.printf(info => {
            return `${info.timestamp}; ${info.level.toUpperCase()}; ${info.message}`;
        });
        return winston.format.combine(winston.format.timestamp(), recordFormat);
    }
}