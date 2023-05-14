import { defineStore } from 'pinia';

import { useAppStore } from '~/app.store';
import { ensureErrorType } from '~/utils/ensure-error-type';
import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';

import type { TranslateRequest } from './models/requests';
import { textPlayer } from './services/text-player';
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

      window.mainAPI.translation.onTranslateText((text, showDefinitions) => {
        globalErrorsStore.clearErrors();

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
            sourceLanguage: app.settings.language.sourceLanguage,
            targetLanguage: app.settings.language.targetLanguage
          },
          showDefinitions
        );
      });

      window.mainAPI.translation.onPlayText(async text => {
        try {
          await textPlayer.playText({ text: text });
        } catch (error: unknown) {
          window.mainAPI.logging.notifyOnError(ensureErrorType(error), 'Error playing text.');
        }
      });

      window.mainAPI.translation.onShowTextInput(() => {
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
