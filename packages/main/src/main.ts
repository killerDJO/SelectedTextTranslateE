import './aliases';
import 'reflect-metadata';

import { app } from 'electron';

import { Application } from '~/presentation/Application';
import { ErrorHandler } from '~/infrastructure/ErrorHandler';
import { Logger } from '~/infrastructure/Logger';
import { Installer } from '~/install/Installer';

import { container } from './inversify.config';

const logger = container.get<Logger>(Logger);

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const isDevelopmentRun = process.execPath.endsWith('electron.exe');
if (isDevelopmentRun) {
  app.setAppUserModelId(process.execPath);
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let application: Application;
app.on('ready', async () => {
  container.get<ErrorHandler>(ErrorHandler).initialize();
  logger.info('Application startup.');
  if (container.get<Installer>(Installer).handleSquirrelEvent()) {
    return;
  }

  application = container.get<Application>(Application);
});

app.on('before-quit', () => {
  logger.info('Application shutdown.');
});

app.on('window-all-closed', () => {
  // do not quit
});
