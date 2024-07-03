import md5 from 'md5';

import type { AccountInfo } from '~/components/history/history-auth/models/account-info.model';
import {
  authService,
  type AuthService
} from '~/components/history/history-auth/services/auth.service';
import type { HistoryRecord } from '~/components/history/models/history-record.model';
import { historyService, type HistoryService } from '~/components/history/services/history.service';
import type { TranslateRequest } from '~/components/translation/models/requests.model';
import { getLogKey, traceTimings } from '~/utils/logging.utils';
import type {
  TranslateResult,
  TranslateDescriptor
} from '~/components/translation/models/translation.model';
import { logger, Logger } from '~/services/logger.service';

import {
  translationResponseParser,
  TranslationResponseParser
} from './translation-response-parser.service';
import { requestsExecutor, RequestsExecutor } from './requests-executor.service';

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
    private readonly requestsExecutor: RequestsExecutor
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
    const response = await traceTimings(this.logger, `[Translator]: Translating ${logKey}`, () =>
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
    // Double-escape string for correct processing by rpc
    const escapedData = this.escapeString(this.escapeString(descriptor.sentence));
    const data = `[[\\"${escapedData}\\",\\"${descriptor.sourceLanguage}\\",\\"${
      descriptor.targetLanguage
    }\\",${descriptor.isForcedTranslation ? 'null' : '1'}],[]]`;
    return this.requestsExecutor.executeGoogleTranslateRequest('MkEWBc', data);
  }

  private escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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
  requestsExecutor
);
