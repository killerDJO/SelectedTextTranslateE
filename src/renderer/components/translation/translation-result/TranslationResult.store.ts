import { ActionContext } from "vuex";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultCommand } from "common/dto/translation/TranslateResultCommand";
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
    setTranslateResult(state: TranslateResultState, translateResultCommand: TranslateResultCommand): void {
        state.translationHistoryRecord = translateResultCommand.historyRecord;
        if (translateResultCommand.defaultView) {
            state.defaultTranslateResultView = translateResultCommand.defaultView;
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
        messageBus.getNotification(Messages.Translation.InProgressCommand, () => commit("setTranslationInProgress"));
        messageBus.getValue<TranslateResultCommand>(Messages.Translation.TranslateResult, translateResult => commit("setTranslateResult", translateResult));
        messageBus.getValue<HistoryRecord>(Messages.Translation.UpdateTranslateResult, historyRecord => commit("updateTranslateResult", historyRecord));
        messageBus.getValue<TranslationViewRendererSettings>(Messages.Translation.TranslationResultViewSettings, translationResultViewSettings => commit("setTranslationResultViewSettings", translationResultViewSettings));
    },
    playText({ state }: ActionContext<TranslateResultState, RootState>): void {
        executeCommand(state, Messages.Translation.PlayTextCommand, translateResult => translateResult.sentence.input);
    },
    translateSuggestion({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        commit("setTranslationInProgress");
        executeCommand(state, Messages.Translation.TranslateCommand, translateResult => translateResult.sentence.suggestion);
    },
    forceTranslation({ commit, state }: ActionContext<TranslateResultState, RootState>): void {
        commit("setTranslationInProgress");
        executeCommand(state, Messages.Translation.ForceTranslateCommand, translateResult => translateResult.sentence.input);
    },
    translateText({ commit }: ActionContext<TranslateResultState, RootState>, text: string): void {
        commit("setTranslationInProgress");
        messageBus.sendCommand(Messages.Translation.TranslateCommand, text);
    },
    setStarredStatus(_: ActionContext<TranslateResultState, RootState>, request: { record: HistoryRecord; isStarred: boolean }): void {
        messageBus.sendCommand<StarCommand>(Messages.Translation.StarTranslateResult, { sentence: request.record.sentence, isForcedTranslation: request.record.isForcedTranslation, isStarred: request.isStarred });
    }
};

function executeCommand(state: TranslateResultState, commandName: Messages, inputGetter: (translateResult: TranslateResult) => string | null): void {
    if (state.translationHistoryRecord === null) {
        return;
    }

    messageBus.sendCommand(commandName, inputGetter(state.translationHistoryRecord.translateResult));
}