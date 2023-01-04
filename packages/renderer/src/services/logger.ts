import { ensureErrorType } from '~/utils/ensure-error-type';

export class Logger {
  public info(message: string): void {
    console.log(`[Info] ${message}`);
    window.mainAPI.logging.logInfo(message);
  }

  public warning(message: string): void {
    console.warn(`[Warning] ${message}`);
    window.mainAPI.logging.logWarning(message);
  }

  public error(error: unknown, message: string): void {
    console.error(`[Error] ${message}`, error);
    window.mainAPI.logging.logError(ensureErrorType(error), message);
  }
}

export const logger = new Logger();
