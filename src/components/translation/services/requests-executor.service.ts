import { hostApi } from '~/host/host-api.service';
import { logger, Logger } from '~/services/logger.service';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';

export class RequestsExecutor {
  public constructor(
    private readonly logger: Logger,
    private readonly settingsProvider: SettingsProvider
  ) {}

  public async executeGoogleTranslateRequest<TContent>(
    rpcId: string,
    data: string
  ): Promise<TContent> {
    const settings = this.settingsProvider.getSettings().core;

    const url = `https://translate.google.com/_/TranslateWebserverUi/data/batchexecute?rpcids=${rpcId}&hl=ru&soc-app=1&soc-platform=1&soc-device=1&rt=c`;
    const formData = encodeURIComponent(`[[["${rpcId}","${data}",null,"generic"]]]`);

    if (settings.logRequests) {
      this.logger.info(`Sending request to google translate: ${url} with data: ${formData}`);
    }

    const response = await hostApi.translation.executeGoogleTranslateRequest(
      url,
      `f.req=${formData}`
    );

    if (settings.logRequests) {
      this.logger.info(`Received response from google translate: ${response}`);
    }

    return this.parseGoogleResponse(response, rpcId);
  }

  private parseGoogleResponse<TContent>(response: string, rpcId: string): TContent {
    const lines = response.split('\n');
    const responseLine = lines.find(line => line.indexOf(rpcId) !== -1);
    if (!responseLine) {
      throw new Error('Unable to find google response');
    }

    const responseLineJson = JSON.parse(`${responseLine}`);
    const responseContent = responseLineJson[0][2];
    return JSON.parse(responseContent);
  }
}

export const requestsExecutor = new RequestsExecutor(logger, settingsProvider);
