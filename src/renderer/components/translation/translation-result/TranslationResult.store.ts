import { ActionContext, Commit } from "vuex";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { TranslationViewRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { StarCommand } from "common/dto/translation/StarCommand";

const messageBus = new MessageBus();

export interface TranslateResultState {
    translationHistoryRecord: HistoryRecord | null;
    translationResultViewSettings: TranslationViewRendererSettings | null;
    isTranslationInProgress: boolean;
    defaultTranslateResultView: TranslateResultViews;
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

        if (state.translationHistoryRecord.sentence !== historyRecord.sentence || state.translationHistoryRecord.isForcedTranslation !== historyRecord.isForcedTranslation) {
            return;
        }

        state.translationHistoryRecord = historyRecord;
    },
    setTranslationResultViewSettings(state: TranslateResultState, translationResultViewSettings: TranslationViewRendererSettings): void {
        state.translationResultViewSettings = translationResultViewSettings;
    },
    setTranslationInProgress(state: TranslateResultState): void {
        state.isTranslationInProgress = true;
    }
}

export const translateResultActions = {
    setup({ commit }: ActionContext<TranslateResultState, RootState>): void {
        messageBus.getNotification(Messages.TranslateResult.InProgressCommand, () => commit("setTranslationInProgress"));
        messageBus.getValue<TranslateResultResponse>(Messages.TranslateResult.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
        messageBus.getValue<HistoryRecord>(Messages.TranslateResult.UpdateTranslateResult, historyRecord => commit("updateTranslateResult", historyRecord));
        messageBus.getValue<TranslationViewRendererSettings>(Messages.TranslateResult.TranslationResultViewSettings, translationResultViewSettings => commit("setTranslationResultViewSettings", translationResultViewSettings));
    },
    playText({ state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommand<string>(state, Messages.TranslateResult.PlayTextCommand, historyRecord => historyRecord.sentence);
    },
    translateSuggestion({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({ text: historyRecord.translateResult.sentence.suggestion, isForcedTranslation: false, refreshCache: false }));
    },
    forceTranslation({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({ text: historyRecord.sentence, isForcedTranslation: true, refreshCache: false }));
    },
    refreshTranslation({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommandWithProgress<TranslationRequest>(
            state,
            commit,
            Messages.TranslateResult.TranslateCommand,
            historyRecord => ({ text: historyRecord.sentence, isForcedTranslation: historyRecord.isForcedTranslation, refreshCache: true }));
    },
    translateText({ commit }: ActionContext<TranslateResultState, RootState>, text: string): void {
        commit("setTranslationInProgress");
        messageBus.sendCommand<TranslationRequest>(Messages.TranslateResult.TranslateCommand, { text, isForcedTranslation: false, refreshCache: false });
    },
    setStarredStatus(_: ActionContext<TranslateResultState, RootState>, request: { record: HistoryRecord; isStarred: boolean }): void {
        messageBus.sendCommand<StarCommand>(Messages.TranslateResult.StarTranslateResult, { sentence: request.record.sentence, isForcedTranslation: request.record.isForcedTranslation, isStarred: request.isStarred });
    }
};

function executeCommand<TRequest>(state: TranslateResultState, commandName: Messages, inputGetter: (historyRecord: HistoryRecord) => TRequest): void {
    if (state.translationHistoryRecord === null) {
        return;
    }

    messageBus.sendCommand<TRequest>(commandName, inputGetter(state.translationHistoryRecord));
}

function executeCommandWithProgress<TRequest>(state: TranslateResultState, commit: Commit, commandName: Messages, inputGetter: (historyRecord: HistoryRecord) => TRequest): void {
    commit("setTranslationInProgress");
    executeCommand<TRequest>(state, commandName, inputGetter);
}