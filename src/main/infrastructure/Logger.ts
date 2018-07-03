import * as winston from "winston";
import { shell } from "electron";
import { injectable } from "inversify";
import * as path from "path";

// tslint:disable-next-line:no-import-side-effect
import "winston-daily-rotate-file";

import { StorageFolderProvider } from "./StorageFolderProvider";


@injectable()
export class Logger {
    private readonly transport: winston.DailyRotateFileTransportInstance;
    private readonly logsDirectory: string;

    constructor(private readonly storageFolderProvider: StorageFolderProvider) {
        this.logsDirectory = path.join(storageFolderProvider.getPath(), "logs");
        const logFilePath = path.join(this.logsDirectory, "log.%DATE%.txt");
        this.transport = new winston.transports.DailyRotateFile({
            filename: logFilePath,
            json: false,
        });

        winston.configure({ transports: [this.transport] });
    }

    public openLogFolder(): void {
        try {
            shell.openItem(this.logsDirectory);
        } catch (e) {
            this.error("Unable to open error log folder.", e);
        }
    }

    public async flush(): Promise<void> {
        (this.transport as any).close();
        return new Promise<void>((resolve, reject) => {
            this.transport.on("finish", resolve);
        });
    }

    public info(message: string): void {
        winston.info(message);
    }

    public warning(message: string): void {
        winston.warn(message);
    }

    public error(message: string, error: Error): void {
        winston.error(`${message}. Error: "${error.message}". Stack trace: "${error.stack}"`);
    }
}