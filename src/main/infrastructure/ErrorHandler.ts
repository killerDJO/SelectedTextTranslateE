import { injectable } from "inversify";
import { dialog, shell } from "electron";

import { Logger } from "infrastructure/Logger";

@injectable()
export class ErrorHandler {
    constructor(private readonly logger: Logger) {
    }

    public initialize(): void {
        process.on("uncaughtException", async err => {
            await this.handleError("Unhandled Error", err);
        });

        process.on("unhandledRejection", async err => {
            await this.handleError("Unhandled Promise Rejection", err);
        });
    }

    private async handleError(title: string, error: Error): Promise<void> {
        this.logger.error(title, error);
        this.openMessageBox();
        this.logger.info("Application shutdown due to main process error.");
        await this.logger.flush();
        process.exit(1);
    }

    private openMessageBox(): void {
        const messageBoxOptions: Electron.MessageBoxOptions = {
            type: "error",
            title: "Selected Text Translate is terminated.",
            message: "Unexpected error has occurred. See error log for more details.",
            buttons: ["Open logs directory", "Close"]
        };
        const clickedButtonIndex = dialog.showMessageBox(messageBoxOptions);
        if (clickedButtonIndex === 0) {
            this.logger.openLogFolder();
        }
    }
}