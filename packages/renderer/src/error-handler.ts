import type { App as VueApp } from 'vue';

import { ensureErrorType } from './utils/ensure-error-type';

export function setupErrorHandling(app: VueApp<Element>): void {
  window.onunhandledrejection = event => {
    sendErrorMessage(event.reason);
  };

  window.onerror = (
    message: string | Event,
    source: string | undefined,
    lineno: number | undefined,
    colno: number | undefined,
    error: Error | undefined
  ) => {
    sendErrorMessage(error || new Error(message.toString()));
  };

  app.config.errorHandler = (error: unknown) => {
    sendErrorMessage(error);
  };
}

function sendErrorMessage(error: unknown): void {
  console.error(error);
  window.mainAPI.logging.notifyOnError(ensureErrorType(error));
}
