import { autoUpdater, shell, dialog, app, MessageBoxOptions } from 'electron';
import { injectable } from 'inversify';

import { SettingsProvider } from '~/infrastructure/SettingsProvider';
import { Logger } from '~/infrastructure/Logger';
import { NotificationSender } from '~/infrastructure/NotificationSender';

@injectable()
export class Updater {
  constructor(
    private readonly logger: Logger,
    private readonly notificationSender: NotificationSender,
    settingsProvider: SettingsProvider
  ) {
    const updateSettings = settingsProvider.getSettings().value.update;
    const feedUrl = `${updateSettings.feedUrl}/${process.platform}/${app.getVersion()}`;
    autoUpdater.setFeedURL({ url: feedUrl });

    autoUpdater.on('checking-for-update', () => this.logger.info('Checking for updates'));
    autoUpdater.on('update-not-available', () =>
      this.notificationSender.send('No updates available.', 'Click to visit releases page.', () =>
        shell.openExternal(updateSettings.releasesUrl)
      )
    );
    autoUpdater.on('update-available', () =>
      this.notificationSender.send('Update available.', 'Update is downloading in background...')
    );
    autoUpdater.on('update-downloaded', (_, releaseNotes, releaseName) =>
      this.promptForUpdate(releaseNotes, releaseName)
    );
    autoUpdater.on('error', error => this.handleError(error));
  }

  public checkForUpdate(): void {
    autoUpdater.checkForUpdates();
  }

  private async promptForUpdate(releaseNotes: string, releaseName: string): Promise<void> {
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: releaseNotes || releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };

    const returnValue = await dialog.showMessageBox(dialogOpts);

    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  }

  private handleError(error: Error): void {
    this.notificationSender.showNonCriticalError('Error during update process', error);
  }
}
