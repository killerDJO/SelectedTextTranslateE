import type { App as VueApp } from 'vue';

import { logger } from './services/logger.service';
import { hostApi } from './host/host-api.service';

export function setupErrorHandling(app: VueApp<Element>): void {
  window.onunhandledrejection = event => {
    sendErrorMessage(event.reason);
  };

  window.onerror = (
    message: string | Event,
    _source: string | undefined,
    _lineno: number | undefined,
    _colno: number | undefined,
    error: Error | undefined
  ) => {
    sendErrorMessage(error || new Error(message.toString()));
  };

  app.config.errorHandler = (error: unknown) => {
    sendErrorMessage(error);
  };
}

function sendErrorMessage(error: unknown): void {
  logger.error(error, 'An error occurred');
  hostApi.notifyOnError();
}
