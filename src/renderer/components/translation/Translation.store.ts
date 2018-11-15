import { Module } from "vuex";
import { remote } from "electron";

import { RootState } from "root.store";

import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { LanguageSettings } from "common/dto/settings/LanguageSettings";
import { Messages } from "common/messaging/Messages";

import { MessageBus } from "common/renderer/MessageBus";

import { TranslateResultState, translateResultMutations, translateResultActions } from "components/translation/translation-result/TranslationResult.store";

const messageBus = new MessageBus();

interface TranslationState extends TranslateResultState {
    showInput: boolean;
    languageSettings: LanguageSettings | null;
}

export const translation: Module<TranslationState, RootState> = {
    namespaced: true,
    state: {
        translationHistoryRecord: null,
        translationResultViewSettings: null,
        isTranslationInProgress: false,
        defaultTranslateResultView: TranslateResultViews.Translation,
        showInput: false,
        languages: new Map<string, string>(),
        languageSettings: null,
        isOffline: false
    },
    mutations: {
        ...translateResultMutations,
        setTranslateResult(state: TranslationState, translateResultCommand: TranslateResultResponse): void {
            translateResultMutations.setTranslateResult(state, translateResultCommand);
            state.showInput = false;
        },
        clearTranslateResult(state: TranslationState): void {
            state.translationHistoryRecord = null;
            state.isTranslationInProgress = false;
            state.showInput = false;
        },
        setTranslationInProgress(state: TranslationState): void {
            translateResultMutations.setTranslationInProgress(state);
            state.showInput = false;
        },
        setShowInput(state: TranslationState): void {
            state.showInput = true;
            state.translationHistoryRecord = null;
        },
        setLanguageSettings(state: TranslationState, languageSettings: LanguageSettings): void {
            state.languageSettings = languageSettings;
        }
    },
    actions: {
        ...translateResultActions,
        setup(context): void {
            translateResultActions.setup(context);
            messageBus.observeNotification(Messages.Translation.ShowInputCommand, () => context.commit("setShowInput"));
            messageBus.observeValue<LanguageSettings>(Messages.Translation.LanguageSettings, languageSettings => context.commit("setLanguageSettings", languageSettings));
            remote.getCurrentWindow().on("hide", () => context.commit("clearTranslateResult"));
        }
    }
};