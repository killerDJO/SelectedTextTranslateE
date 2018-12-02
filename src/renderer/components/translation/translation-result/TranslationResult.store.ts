import { ActionContext, Commit } from "vuex";

import { RootState } from "root.store";

import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { Messages } from "common/messaging/Messages";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { StarRequest } from "common/dto/translation/StarRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { UpdateTagsRequest } from "common/dto/translation/UpdateTagsRequest";
import { Language } from "common/dto/settings/Language";

import { MessageBus } from "common/renderer/MessageBus";
import { TranslationKey } from "common/dto/translation/TranslationKey";

const messageBus = new MessageBus();

export interface TranslateResultState {
    translationHistoryRecord: HistoryRecord | null;
    translationResultViewSettings: TranslationViewRendererSettings | null;
    isTranslationInProgress: boolean;
    defaultTranslateResultView: TranslateResultViews;
    languages: Map<string, string>;
    isOffline: boolean;
}

export const translateResultMutations = {
    setTranslateResult(state: TranslateResultState, translateResultResponse: TranslateResultResponse): void {
        state.translationHistoryRecord = translateResultResponse.historyRecord;
        if (translateResultResponse.defaultView) {
            state.defaultTranslateResultView = translateResultResponse.defaultView;
        }
        state.isTranslationInProgress = false;
    },
    updateTranslateResult(state: TranslateResultState, historyRecord: HistoryRecord): void {
        if (state.translationHistoryRecord === null) {
            return;
        }

        if (state.translationHistoryRecord.sentence !== historyRecord.sentence
            || state.translationHistoryRecord.isForcedTranslation !== historyRecord.isForcedTranslation
            || state.translationHistoryRecord.sourceLanguage !== historyRecord.sourceLanguage
            || state.translationHistoryRecord.targetLanguage !== historyRecord.targetLanguage) {
            return;
        }

        state.translationHistoryRecord = historyRecord;
    },
    setTranslationResultViewSettings(state: TranslateResultState, translationResultViewSettings: TranslationViewRendererSettings): void {
        state.translationResultViewSettings = translationResultViewSettings;
    },
    setTranslationInProgress(state: TranslateResultState): void {
        state.isTranslationInProgress = true;
    },
    setLanguages(state: TranslateResultState, languages: Language[]): void {
        for (const language of languages) {
            state.languages.set(language.code, language.name);
        }
    },
    setOfflineStatus(state: TranslateResultState, isOffline: boolean): void {
        state.isOffline = isOffline;
    }
};

export const translateResultActions = {
    setup({ commit }: ActionContext<TranslateResultState, RootState>): void {
        messageBus.observeNotification(Messages.TranslateResult.InProgressCommand, () => commit("setTranslationInProgress"));
        messageBus.observeValue<TranslateResultResponse>(Messages.TranslateResult.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
        messageBus.observeValue<HistoryRecord>(Messages.TranslateResult.UpdateTranslateResult, historyRecord => commit("updateTranslateResult", historyRecord));
        messageBus.observeValue<TranslationViewRendererSettings>(Messages.TranslateResult.TranslationResultViewSettings, translationResultViewSettings => commit("setTranslationResultViewSettings", translationResultViewSettings));
        messageBus.observeValue<Language[]>(Messages.TranslateResult.Languages, languages => commit("setLanguages", languages));

        commit("setOfflineStatus", !navigator.onLine);
        window.ononline = () => commit("setOfflineStatus", false);
        window.onoffline = () => commit("setOfflineStatus", true);
    },
    playText({ state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommand<PlayTextRequest>(state, Messages.TranslateResult.PlayTextCommand, historyRecord => ({
            text: historyRecord.sentence,
            language: historyRecord.sourceLanguage
        }));
    },
    translateSuggestion({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({
                text: historyRecord.translateResult.sentence.suggestion,
                isForcedTranslation: false,
                refreshCache: false,
                sourceLanguage: historyRecord.sourceLanguage,
                targetLanguage: historyRecord.targetLanguage
            }));
    },
    forceTranslation({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({
                text: historyRecord.sentence,
                isForcedTranslation: true,
                refreshCache: false,
                sourceLanguage: historyRecord.sourceLanguage,
                targetLanguage: historyRecord.targetLanguage
            }));
    },
    refreshTranslation({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({
                text: historyRecord.sentence,
                isForcedTranslation: historyRecord.isForcedTranslation,
                refreshCache: true,
                sourceLanguage: historyRecord.sourceLanguage,
                targetLanguage: historyRecord.targetLanguage
            }));
    },
    changeLanguage({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        if (state.translationHistoryRecord === null) {
            return;
        }

        const language = state.translationHistoryRecord.translateResult.sentence.languageSuggestion;
        if (language === null) {
            return;
        }

        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({
                text: historyRecord.sentence,
                isForcedTranslation: historyRecord.isForcedTranslation,
                refreshCache: false,
                sourceLanguage: language,
                targetLanguage: historyRecord.sourceLanguage
            }));
    },
    translateText({ commit }: ActionContext<TranslateResultState, RootState>, request: TranslationRequest): void {
        commit("setTranslationInProgress");
        messageBus.sendCommand<TranslationRequest>(Messages.TranslateResult.TranslateCommand, request);
    },
    playTextFromRequest(_: ActionContext<TranslateResultState, RootState>, request: PlayTextRequest): void {
        messageBus.sendCommand<PlayTextRequest>(Messages.TranslateResult.PlayTextCommand, request);
    },
    search({ state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommand<string>(state, Messages.TranslateResult.Search, historyRecord => historyRecord.sentence);
    },
    setStarredStatus(_: ActionContext<TranslateResultState, RootState>, request: { record: TranslationKey; isStarred: boolean }): void {
        messageBus.sendCommand<StarRequest>(
            Messages.TranslateResult.StarTranslateResult,
            {
                ...cloneTranslationKey(request.record),
                isStarred: request.isStarred
            });
    },
    updateTags(_: ActionContext<TranslateResultState, RootState>, request: { record: TranslationKey; tags: ReadonlyArray<string> }): void {
        messageBus.sendCommand<UpdateTagsRequest>(
            Messages.TranslateResult.UpdateTags,
            {
                ...cloneTranslationKey(request.record),
                tags: request.tags
            });
    },
};

function executeCommand<TRequest>(state: TranslateResultState, commandName: string, inputGetter: (historyRecord: HistoryRecord) => TRequest): void {
    if (state.translationHistoryRecord === null) {
        return;
    }

    messageBus.sendCommand<TRequest>(commandName, inputGetter(state.translationHistoryRecord));
}

function executeCommandWithProgress<TRequest>(state: TranslateResultState, commit: Commit, commandName: string, inputGetter: (historyRecord: HistoryRecord) => TRequest): void {
    commit("setTranslationInProgress");
    executeCommand<TRequest>(state, commandName, inputGetter);
}

function cloneTranslationKey(record: TranslationKey): TranslationKey {
    return {
        sentence: record.sentence,
        isForcedTranslation: record.isForcedTranslation,
        sourceLanguage: record.sourceLanguage,
        targetLanguage: record.targetLanguage
    };
}