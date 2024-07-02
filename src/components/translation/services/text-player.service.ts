import type { PlayTextRequest } from '~/components/translation/models/requests.model';
import { logger, Logger } from '~/services/logger.service';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';
import { hostApi } from '~/host/host-api.service';
import { Settings } from '~/host/models/settings.model';

import { requestsExecutor, RequestsExecutor } from './requests-executor.service';

export class TextPlayer {
  private isPlayInProgress = false;

  public constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger,
    private readonly requestsExecutor: RequestsExecutor
  ) {}

  public async playText(request: PlayTextRequest): Promise<void> {
    if (this.isPlayInProgress) {
      return;
    }

    this.isPlayInProgress = true;

    try {
      hostApi.translation.setPlayingState(true);
      const settings = this.settingsProvider.getSettings();

      const language = request.language || settings.translation.sourceLanguage;
      this.logger.info(`Playing ${this.getLogKey(request.text, language)}`);

      const content = await this.getAudioContent(request.text, language);
      if (!content) {
        return;
      }

      await this.playFile(content, settings);

      this.logger.info(`End playing ${this.getLogKey(request.text, language)}`);
    } finally {
      hostApi.translation.setPlayingState(false);
      this.isPlayInProgress = false;
    }
  }

  private async playFile(audioContent: string, settings: Settings): Promise<void> {
    const volume = settings.core.playVolume;

    const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
    audio.volume = volume / 100;

    const endPromise = new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject('Play error');
    });

    try {
      await audio.play();
      await endPromise;
    } catch (error) {
      this.logger.error(error, 'Unable to play audio file.');
    }
  }

  private getLogKey(text: string, language: string): string {
    return `text '${text}' with language ${language}`;
  }

  private async getAudioContent(text: string, language: string): Promise<string> {
    const data = `[\\"${text}\\",\\"${language}\\",true,\\"null\\"]`;
    const response = await this.requestsExecutor.executeGoogleTranslateRequest<string[]>(
      'jQ1olc',
      data
    );
    return response[0];
  }
}

export const textPlayer = new TextPlayer(settingsProvider, logger, requestsExecutor);
