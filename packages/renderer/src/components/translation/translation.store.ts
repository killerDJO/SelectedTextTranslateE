import { defineStore } from 'pinia';

import { useAppStore } from '~/app.store';
import { ensureErrorType } from '~/utils/ensure-error-type';

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
      const translateResultStore = useTranslateResultStore();
      const appStore = useAppStore();

      window.mainAPI.translation.onTranslateText((text, showDefinitions) => {
        if (!text) {
          translateResultStore.clearCurrentTranslation();
          this.nonTextTranslation = true;
          return;
        }

        this.nonTextTranslation = false;
        this.showInput = false;

        translateResultStore.translateText(
          {
            sentence: text,
            isForcedTranslation: false,
            refreshCache: false,
            sourceLanguage: appStore.settings.language.sourceLanguage,
            targetLanguage: appStore.settings.language.targetLanguage
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
        translateResultStore.clearCurrentTranslation();

        this.nonTextTranslation = false;
        this.showInput = true;
      });
    },
    translateText(request: TranslateRequest) {
      this.nonTextTranslation = false;
      this.showInput = false;

      const translateResultStore = useTranslateResultStore();
      translateResultStore.translateText(request);
    }
  }
});
