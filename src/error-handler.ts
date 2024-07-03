import type { App as VueApp } from 'vue';

import { logger } from './services/logger.service';
import { hostApi } from './host/host-api.service';

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
    const fullMessage = `${message} at ${source ?? '-'}:${lineno ?? '-'}:${colno ?? '-'}`;
    sendErrorMessage(error ?? fullMessage);
  };

  app.config.errorHandler = (error: unknown) => {
    sendErrorMessage(error);
  };
}

function sendErrorMessage(error: unknown): void {
  logger.error(error, 'An error occurred');
  hostApi.notifications.showErrorNotification('An error has occurred.');
}
