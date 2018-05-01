import * as logger from "winston";
import { injectable } from "inversify";
import * as path from "path";

// tslint:disable-next-line:no-import-side-effect
import "winston-daily-rotate-file";

import { StorageFolderProvider } from "./StorageFolderProvider";

@injectable()
export class Logger {
    constructor(private readonly storageFolderProvider: StorageFolderProvider) {
        const logFilePath = path.join(storageFolderProvider.getPath(), "log.txt");
        logger.configure({
            transports: [
                new logger.transports.DailyRotateFile({
                    filename: logFilePath,
                    json: false,
                })
            ]
        });
    }

    public info(message: string): void {
        logger.info(message);
    }

    public warning(message: string): void {
        logger.warn(message);
    }

    public error(message: string, error: Error): void {
        logger.error(`${message}. Error: "${error.message}". Stack trace: "${error.stack}"`);
    }
}