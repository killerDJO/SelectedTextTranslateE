import type { Settings } from '@selected-text-translate/common/settings/settings';

import type { PlayTextRequest } from '~/components/translation/models/requests';
import { logger, Logger } from '~/services/logger';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider';

export class TextPlayer {
  private isPlayInProgress = false;

  public constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger
  ) {}

  public async playText(request: PlayTextRequest): Promise<void> {
    if (this.isPlayInProgress) {
      return;
    }

    this.isPlayInProgress = true;

    try {
      window.mainAPI.translation.setPlayingState(true);
      const settings = this.settingsProvider.getSettings();

      const language = request.language || settings.language.sourceLanguage;
      this.logger.info(`Playing ${this.getLogKey(request.text, language)}`);

      const content = await this.getAudioContent(request.text, language);

      await this.playFile(content, settings);

      this.logger.info(`End playing ${this.getLogKey(request.text, language)}`);
    } finally {
      window.mainAPI.translation.setPlayingState(false);
      this.isPlayInProgress = false;
    }
  }

  private async playFile(audioContent: string, settings: Settings): Promise<void> {
    const volume = settings.engine.playVolume;

    const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
    audio.volume = volume / 100;

    const endPromise = new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject('Play error');
    });

    try {
      await audio.play();
      await endPromise;
    } catch (error: any) {
      this.logger.error('Unable to play audio file.', error);
    }
  }

  private getLogKey(text: string, language: string): string {
    return `text '${text}' with language ${language}`;
  }

  private async getAudioContent(text: string, language: string): Promise<string> {
    const data = `[\\"${text}\\",\\"${language}\\",true,\\"null\\"]`;
    const response = await window.mainAPI.translation.executeGoogleRequest<string[]>(
      'jQ1olc',
      data
    );
    return response[0];
  }
}

export const textPlayer = new TextPlayer(settingsProvider, logger);
