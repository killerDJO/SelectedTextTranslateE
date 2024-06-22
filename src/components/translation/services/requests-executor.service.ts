import { hostApi } from '~/host/host-api.service';

export class RequestsExecutor {
  public constructor() {}

  public async executeGoogleTranslateRequest<TContent>(
    rpcId: string,
    data: string
  ): Promise<TContent> {
    const url = `https://translate.google.com/_/TranslateWebserverUi/data/batchexecute?rpcids=${rpcId}&hl=ru&soc-app=1&soc-platform=1&soc-device=1&rt=c`;
    const formData = encodeURIComponent(`[[["${rpcId}","${data}",null,"generic"]]]`);

    const response = await hostApi.executeGoogleTranslateRequest(url, `f.req=${formData}`);

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

export const requestsExecutor = new RequestsExecutor();
