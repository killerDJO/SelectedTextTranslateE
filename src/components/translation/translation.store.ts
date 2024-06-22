import { defineStore } from 'pinia';

import { useAppStore } from '~/app.store';
import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';
import { hostApi } from '~/host/host-api.service';
import { logger } from '~/services/logger.service';

import type { TranslateRequest } from './models/requests.model';
import { textPlayer } from './services/text-player.service';
import { useTranslateResultStore } from './translation-result/translation-result.store';

interface TranslationState {
  showInput: boolean;
  nonTextTranslation: boolean;
}

export const useTranslationStore = defineStore('translation', {
  state: () => {
    const state: TranslationState = {
      showInput: false,
      nonTextTranslation: false
    };
    return state;
  },
  getters: {},
  actions: {
    setup() {
      const translateResult = useTranslateResultStore();
      const app = useAppStore();
      const globalErrorsStore = useGlobalErrorsStore();

      hostApi.onTranslateText(async showDefinitions => {
        globalErrorsStore.clearErrors();
        const text = await hostApi.getTextFromClipboard();

        if (!text) {
          translateResult.clearCurrentTranslation();
          this.nonTextTranslation = true;
          return;
        }

        this.nonTextTranslation = false;
        this.showInput = false;

        translateResult.translateText(
          {
            sentence: text,
            isForcedTranslation: false,
            sourceLanguage: app.settings.translation.sourceLanguage,
            targetLanguage: app.settings.translation.targetLanguage
          },
          showDefinitions
        );
      });

      hostApi.onPlayText(async () => {
        try {
          const text = await hostApi.getTextFromClipboard();
          await textPlayer.playText({ text: text });
        } catch (error: unknown) {
          logger.error(error, 'Error playing text.');
          hostApi.notifyOnError('Error playing text.');
        }
      });

      hostApi.onShowInput(() => {
        translateResult.clearCurrentTranslation();
        globalErrorsStore.clearErrors();

        this.nonTextTranslation = false;
        this.showInput = true;
      });
    },
    translateText(request: TranslateRequest) {
      this.nonTextTranslation = false;
      this.showInput = false;

      const translateResult = useTranslateResultStore();
      translateResult.translateText(request);
    }
  }
});
