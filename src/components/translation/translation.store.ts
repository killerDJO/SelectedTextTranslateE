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
      // Since events will be sent before setup, we read last command from the host API
      hostApi
        .getLastTranslationCommand()
        .then(command => {
          if (!command) {
            logger.warning('No last translation command found on startup.');
            return;
          }

          if (command === 'Play') {
            this.handlePlayTextCommand();
            return;
          }

          if (command === 'ShowInput') {
            this.handleShowInputCommand();
            return;
          }

          this.handleTranslateTextCommand(command.Translate);
        })
        .catch(error => {
          logger.error(error, 'Error getting last translation command.');
        });

      hostApi.onTranslateText(showDefinitions => this.handleTranslateTextCommand(showDefinitions));
      hostApi.onPlayText(() => this.handlePlayTextCommand());
      hostApi.onShowInput(() => this.handleShowInputCommand());

      hostApi.onBeforeShow(() => {
        const translateResult = useTranslateResultStore();
        translateResult.clearCurrentTranslation();
        translateResult.isTranslationInProgress = true;
        this.showInput = false;
      });
    },
    async handlePlayTextCommand() {
      try {
        const text = await hostApi.getTextFromClipboard();
        await textPlayer.playText({ text: text });
      } catch (error: unknown) {
        logger.error(error, 'Error playing text.');
        hostApi.notifyOnError('Error playing text.');
      }
    },
    translateText(request: TranslateRequest) {
      this.nonTextTranslation = false;
      this.showInput = false;

      const translateResult = useTranslateResultStore();
      translateResult.translateText(request);
    },
    handleShowInputCommand() {
      const translateResult = useTranslateResultStore();
      const globalErrorsStore = useGlobalErrorsStore();

      translateResult.clearCurrentTranslation();
      globalErrorsStore.clearErrors();

      this.nonTextTranslation = false;
      this.showInput = true;
    },
    async handleTranslateTextCommand(showDefinitions: boolean) {
      const translateResult = useTranslateResultStore();
      const globalErrorsStore = useGlobalErrorsStore();
      const app = useAppStore();

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
    }
  }
});
