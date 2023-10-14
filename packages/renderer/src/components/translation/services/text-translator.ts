import md5 from 'md5';

import type { AccountInfo } from '~/components/history/history-auth/models/account-info';
import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth-service';
import type { HistoryRecord } from '~/components/history/models/history-record';
import { historyService, type HistoryService } from '~/components/history/services/history-service';
import type { TranslateRequest } from '~/components/translation/models/requests';
import { getLogKey, traceTimings } from '~/utils/logging';
import type {
  TranslateResult,
  TranslateDescriptor
} from '~/components/translation/models/translation';
import { logger, Logger } from '~/services/logger';

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
    private readonly authService: AuthService
  ) {}

  public async translate(
    request: TranslateRequest,
    skipStatistics: boolean
  ): Promise<TranslationResponse> {
    this.logger.info(`[Translator]: Translating: "${getLogKey(request)}".`);

    const sanitizedSentence = this.sanitizeSentence(request.sentence);

    if (sanitizedSentence === '') {
      return {};
    }

    const account = await this.authService.getAccount();
    if (!account) {
      return { result: await this.getResponseFromService(request) };
    }

    const id = this.generateId(request, account);

    const [historyRecord, translateResult] = await Promise.all([
      this.getHistoryRecord(id),
      this.getResponseFromService(request)
    ]);

    let updatedRecord: HistoryRecord;
    if (!historyRecord) {
      updatedRecord = await this.historyService.createHistoryRecord(id, request, translateResult);
    } else {
      updatedRecord = await this.historyService.updateHistoryRecord(
        historyRecord,
        translateResult,
        !skipStatistics,
        !skipStatistics
      );
    }

    return {
      result: updatedRecord.translateResult,
      historyRecord: updatedRecord
    };
  }

  private async getResponseFromService(descriptor: TranslateDescriptor): Promise<TranslateResult> {
    const logKey = getLogKey(descriptor);
    const response = await traceTimings(this.logger, `[Translator]: Translating ${logKey}.`, () =>
      this.getTranslationResponse(descriptor)
    );

    return this.responseParser.parse(response, descriptor.sentence);
  }

  private async getHistoryRecord(id: string): Promise<HistoryRecord | undefined> {
    return traceTimings(this.logger, `[Translator]: Loading history record ${id}`, () =>
      this.historyService.getRecord(id)
    );
  }

  private sanitizeSentence(sentence: string | null): string {
    return (sentence || '').trim();
  }

  private async getTranslationResponse(descriptor: TranslateDescriptor): Promise<unknown> {
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
  authService
);
