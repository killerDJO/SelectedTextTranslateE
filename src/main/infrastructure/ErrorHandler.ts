import { injectable } from "inversify";
import { Logger } from "./Logger";

@injectable()
export class ErrorHandler {
    constructor(private readonly logger: Logger) {
    }

    public initialize(): void {
        process.on("uncaughtException", err => {
            this.handleError("Unhandled Error", err);
        });

        process.on("unhandledRejection", err => {
            this.handleError("Unhandled Promise Rejection", err);
        });
    }

    private handleError(title: string, error: Error): void {
        this.logger.error(title, error);
        process.exit();
    }
}