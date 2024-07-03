import { hostApi } from '~/host/host-api.service';
import { ensureErrorType } from '~/utils/error-handling.utils';

export class Logger {
  public info(message: string): void {
    console.log(`[Info] ${message}`);
    hostApi.logging.logInfo(message);
  }

  public warning(message: string): void {
    console.warn(`[Warning] ${message}`);
    hostApi.logging.logWarning(message);
  }

  public error(error: unknown, message: string): void {
    console.error(`[Error] ${message}`, error);
    hostApi.logging.logError(ensureErrorType(error), message);
  }
}

export const logger = new Logger();
