import { Logger } from "infrastructure/Logger";

import { HistorySyncService } from "services/history/HistorySyncService";
import { FilePlayer } from "services/FilePlayer";

// tslint:disable-next-line:no-unused-expression
new HistorySyncService();
// tslint:disable-next-line:no-unused-expression
new FilePlayer();

const logger = new Logger();
window.onerror = (message: string | Event, source: string | undefined, lineno: number | undefined, colno: number | undefined, error: Error | undefined) => {
    logger.error("Unhandled error.", error || new Error(message.toString()));
};

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    logger.error("Unhandled rejection.", event.reason);
});