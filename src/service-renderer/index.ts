import { HistorySyncService } from "history/HistorySyncService";
import { Logger } from "infrastructure/Logger";

// tslint:disable-next-line:no-unused-expression
new HistorySyncService();

const logger = new Logger();
window.onerror = (message: string | Event, source: string | undefined, lineno: number | undefined, colno: number | undefined, error: Error | undefined) => {
    logger.error("Unhandled error.", error || new Error(message.toString()));
};