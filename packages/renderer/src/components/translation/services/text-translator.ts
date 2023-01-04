import md5 from 'md5';

import type { AccountInfo } from '~/components/history/history-auth/models/account-info';
import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth-service';
import type { HistoryRecord } from '~/components/history/models/history-record';
import { historyService, type HistoryService } from '~/components/history/services/history-service';
import type { TranslateRequest } from '~/components/translation/models/requests';
import type {
  TranslateResult,
  TranslateDescriptor
} from '~/components/translation/models/translation';
import { logger, Logger } from '~/services/logger';
import { settingsProvider, type SettingsProvider } from '~/services/settings-provider';
import { getLogKey } from '~/utils/logging';

import {
  translationResponseParser,
  TranslationResponseParser
} from './translation-response-parser';

export type TranslationResponse = {
  result?: TranslateResult | undefined;
  historyRecord?: HistoryRecord | undefined;
};

export class TextTranslator {
  public constructor(
    private readonly logger: Logger,
    private readonly responseParser: TranslationResponseParser,
    private readonly historyService: HistoryService,
    private readonly authService: AuthService,
    private readonly settingsProvider: SettingsProvider
  ) {}

  public async translate(
    request: TranslateRequest,
    skipStatistics: boolean
  ): Promise<TranslationResponse> {
    this.logger.info(`Translating text: "${request.sentence}".`);

    const sanitizedSentence = this.sanitizeSentence(request.sentence);

    if (sanitizedSentence === '') {
      return {};
    }

    const account = await this.authService.getAccount();
    if (!account) {
      return { result: await this.getResponseFromService(request) };
    }

    const id = this.generateId(request, account);
    const historyRecord = await this.historyService.getRecord(this.generateId(request, account));

    const updatedRecord = await this.getTranslateResult(
      id,
      request,
      request.refreshCache,
      skipStatistics,
      historyRecord
    );

    return {
      result: updatedRecord.translateResult,
      historyRecord: updatedRecord
    };
  }

  private async getTranslateResult(
    id: string,
    descriptor: TranslateDescriptor,
    refreshCache: boolean,
    skipStatistics: boolean,
    historyRecord: HistoryRecord | undefined
  ): Promise<HistoryRecord> {
    const incrementTranslationsNumber = !refreshCache && !skipStatistics;

    if (!historyRecord || this.isHistoryRecordExpired(historyRecord) || refreshCache) {
      this.logger.info(`Serving translation ${getLogKey(descriptor)} from service.`);
      const translateResult = await this.getResponseFromService(descriptor);

      if (!historyRecord) {
        return this.historyService.createHistoryRecord(id, descriptor, translateResult);
      } else {
        return this.historyService.updateHistoryRecord(
          historyRecord,
          translateResult,
          incrementTranslationsNumber,
          incrementTranslationsNumber
        );
      }
    }

    this.logger.info(`Serving translation ${getLogKey(descriptor)} from dictionary.`);

    if (incrementTranslationsNumber) {
      return this.historyService.incrementTranslationsNumber(historyRecord);
    }

    return historyRecord;
  }

  private isHistoryRecordExpired(historyRecord: HistoryRecord): boolean {
    const currentTime = Date.now();
    const elapsedMilliseconds = currentTime - historyRecord.lastModifiedDate;
    const MillisecondsInSecond = 1000;
    const SecondsInMinute = 60;
    const MinutesInHour = 60;
    const HoursInDay = 24;
    const elapsedDays =
      elapsedMilliseconds / MillisecondsInSecond / SecondsInMinute / MinutesInHour / HoursInDay;
    const isVersionExpired =
      historyRecord.translateResult.version !== TranslationResponseParser.Version;
    return (
      elapsedDays > this.settingsProvider.getSettings().engine.historyRefreshInterval ||
      isVersionExpired
    );
  }

  private async getResponseFromService(descriptor: TranslateDescriptor): Promise<TranslateResult> {
    const response = await this.getTranslationResponse(descriptor);
    return this.responseParser.parse(response, descriptor.sentence);
  }

  private sanitizeSentence(sentence: string | null): string {
    return (sentence || '').trim();
  }

  private async getTranslationResponse(descriptor: TranslateDescriptor): Promise<any> {
    const data = `[[\\"${descriptor.sentence}\\",\\"${descriptor.sourceLanguage}\\",\\"${
      descriptor.targetLanguage
    }\\",${descriptor.isForcedTranslation ? 'null' : 'true'}],[null]]`;
    return window.mainAPI.translation.executeGoogleRequest('MkEWBc', data);
  }

  private generateId(descriptor: TranslateDescriptor, account: AccountInfo) {
    return `${md5(descriptor.sentence)}${descriptor.isForcedTranslation ? '-forced' : ''}-${
      descriptor.sourceLanguage
    }-${descriptor.targetLanguage}-${account.uid}`;
  }
}

export const textTranslator = new TextTranslator(
  logger,
  translationResponseParser,
  historyService,
  authService,
  settingsProvider
);
