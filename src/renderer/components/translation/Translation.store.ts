import { Module, ActionContext } from "vuex";

import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { MessageBus } from "communication/MessageBus";
import { Messages } from "common/messaging/Messages";
import { RootState } from "root.store";
import { remote } from "electron";
import { TranslateResultState, translateResultMutations, translateResultActions } from "components/translation/translation-result/TranslationResult.store";

const messageBus = new MessageBus();

interface TranslationState extends TranslateResultState {
    showInput: boolean;
}

export const translation: Module<TranslationState, RootState> = {
    namespaced: true,
    state: {
        translationHistoryRecord: null,
        translationResultViewSettings: null,
        isTranslationInProgress: false,
        defaultTranslateResultView: TranslateResultViews.Translation,
        showInput: false
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
        }
    },
    actions: {
        ...translateResultActions,
        setup(context): void {
            translateResultActions.setup(context);
            messageBus.getNotification(Messages.Translation.ShowInputCommand, () => context.commit("setShowInput"));
            remote.getCurrentWindow().on("hide", () => context.commit("clearTranslateResult"));
        }
    }
};