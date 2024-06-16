import { defineStore } from 'pinia';

import { TranslateResultViews } from '~/components/translation/models/translate-result-views.enum';
import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type { TranslateResult, TranslateDescriptor } from '../models/translation.model';
import type { PlayTextRequest, TranslateRequest } from '../models/requests.model';
import { textTranslator } from '../services/text-translator.service';
import { searchExecutor } from '../services/search-executor.service';
import { textPlayer } from '../services/text-player.service';
import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';
import { historyService } from '~/components/history/services/history.service';
import { hostApi } from '~/host/host-api.service';
import { Tag } from '~/host/models/settings.model';

export interface TranslateResultState {
  translateDescriptor?: TranslateDescriptor;
  translateResult?: TranslateResult;
  historyRecord?: HistoryRecord;
  isTranslationInProgress: boolean;
  defaultTranslateResultView: TranslateResultViews;
}

export const useTranslateResultStore = defineStore('translate-result', {
  state: () => {
    const state: TranslateResultState = {
      translateDescriptor: undefined,
      translateResult: undefined,
      historyRecord: undefined,
      isTranslationInProgress: false,
      defaultTranslateResultView: TranslateResultViews.Translation
    };
    return state;
  },
  getters: {},
  actions: {
    clearCurrentTranslation() {
      this.translateResult = undefined;
      this.translateDescriptor = undefined;
      this.historyRecord = undefined;
    },

    async translateText(
      request: TranslateRequest,
      showDefinitions = false,
      skipStatistics = false
    ) {
      this.clearCurrentTranslation();

      this.isTranslationInProgress = true;
      this.translateDescriptor = getDescriptor(request);

      try {
        const translateResponse = await textTranslator.translate(request, skipStatistics);
        this.translateResult = translateResponse.result;
        this.historyRecord = translateResponse.historyRecord;
        this.defaultTranslateResultView = showDefinitions
          ? TranslateResultViews.Definition
          : TranslateResultViews.Translation;

        if (this.historyRecord) {
          hostApi.emitHistoryRecordChangeEvent(this.historyRecord.id);
        }
      } catch (e: unknown) {
        useGlobalErrorsStore().addError('Unable to translate text.', e);
      } finally {
        this.isTranslationInProgress = false;
      }
    },

    async showHistoryRecord(record: HistoryRecord) {
      await this.translateText(getDescriptor(record), false, true);
    },
    async patchHistoryRecord(record: HistoryRecord) {
      this.historyRecord = record;
      this.translateResult = record.translateResult;
    },
    async playText(request: PlayTextRequest) {
      try {
        await textPlayer.playText(request);
      } catch (e: unknown) {
        useGlobalErrorsStore().addError('Unable to play text.', e);
      }
    },
    async playCurrentSentence() {
      if (!this.translateDescriptor) {
        return;
      }

      await this.playText({
        text: this.translateDescriptor?.sentence,
        language: this.translateDescriptor?.sourceLanguage
      });
    },
    async translateSuggestion() {
      if (!this.translateResult?.sentence.suggestion || !this.translateDescriptor) {
        return;
      }

      await this.translateText({
        sentence: this.translateResult.sentence.suggestion,
        isForcedTranslation: false,
        sourceLanguage: this.translateDescriptor.sourceLanguage,
        targetLanguage: this.translateDescriptor.targetLanguage
      });
    },
    async forceTranslation() {
      if (!this.translateResult?.sentence || !this.translateDescriptor) {
        return;
      }

      await this.translateText({
        sentence: this.translateResult.sentence.input,
        isForcedTranslation: true,
        sourceLanguage: this.translateDescriptor.sourceLanguage,
        targetLanguage: this.translateDescriptor.targetLanguage
      });
    },
    async changeLanguage() {
      if (!this.translateResult?.sentence || !this.translateDescriptor) {
        return;
      }

      const language = this.translateResult.sentence.languageSuggestion;
      if (language === null) {
        return;
      }

      await this.translateText({
        sentence: this.translateResult.sentence.input,
        isForcedTranslation: this.translateDescriptor.isForcedTranslation,
        sourceLanguage: language,
        targetLanguage: this.translateDescriptor.targetLanguage
      });
    },
    search() {
      if (!this.translateDescriptor) {
        return;
      }
      searchExecutor.search(this.translateDescriptor?.sentence);
    },
    async setStarredStatus(isStarred: boolean) {
      await updateRecord(this, record => historyService.setStarredStatus(record, isStarred));
    },
    async updateTags(tags: ReadonlyArray<Tag>) {
      await updateRecord(this, record => historyService.updateTags(record, tags));
    },
    async archive() {
      await updateRecord(this, record => historyService.setArchivedStatus(record, true));
    },
    async unarchive() {
      await updateRecord(this, record => historyService.setArchivedStatus(record, false));
    },
    async hardDelete() {
      if (!this.historyRecord) {
        throw new Error('History record is not available.');
      }

      try {
        this.isTranslationInProgress = true;
        await historyService.hardDelete(this.historyRecord.id);
        hostApi.emitHistoryRecordChangeEvent(this.historyRecord.id);
        this.clearCurrentTranslation();
      } finally {
        this.isTranslationInProgress = false;
      }
    },
    async hide() {
      await hostApi.hideWindow();
    }
  }
});

async function updateRecord(
  store: TranslateResultState,
  action: (record: HistoryRecord) => Promise<void>
) {
  try {
    if (!store.historyRecord) {
      throw new Error('History record is not available.');
    }

    const actionPromise = action(store.historyRecord);
    hostApi.emitHistoryRecordChangeEvent(store.historyRecord!.id);
    store.historyRecord = await historyService.getRecord(store.historyRecord.id, true);
    await actionPromise;
  } catch (e: unknown) {
    useGlobalErrorsStore().addError('Unable to update history record.', e);
  }
}

function getDescriptor(request: TranslateDescriptor): TranslateDescriptor {
  return {
    sentence: request.sentence,
    isForcedTranslation: request.isForcedTranslation,
    sourceLanguage: request.sourceLanguage,
    targetLanguage: request.targetLanguage
  };
}
