import { Module } from "vuex";

import { RootState } from "root.store";

import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { SignRequest } from "common/dto/history/account/SignRequest";

const messageBus = new MessageBus();

interface HistorySyncState {
    currentUser: AccountInfo | null;
    isSyncInProgress: boolean;

    signInResponse: SignInResponse | null;
    signUpResponse: SignUpResponse | null;
}

export const historySync: Module<HistorySyncState, RootState> = {
    namespaced: true,
    state: {
        currentUser: null,
        isSyncInProgress: false,
        signInResponse: null,
        signUpResponse: null
    },
    mutations: {
        setCurrentUser(state: HistorySyncState, currentUser: AccountInfo | null): void {
            state.currentUser = currentUser;
        },
        setSyncStatus(state: HistorySyncState, isSyncInProgress: boolean): void {
            state.isSyncInProgress = isSyncInProgress;
        },
        setSignInResponse(state: HistorySyncState, signInResponse: SignInResponse | null): void {
            state.signInResponse = signInResponse;
        },
        setSignUpResponse(state: HistorySyncState, signUpResponse: SignUpResponse | null): void {
            state.signUpResponse = signUpResponse;
        }
    },
    actions: {
        setup({ commit }): void {
            messageBus.observeValue<AccountInfo | null>(Messages.History.CurrentUser, currentUser => commit("setCurrentUser", currentUser));
            messageBus.observeValue<AccountInfo | null>(Messages.History.SyncState, isSyncInProgress => commit("setSyncStatus", isSyncInProgress));

        },
        resetResponses({ commit }): void {
            commit("setSignInResponse", null);
            commit("setSignUpResponse", null);
        },
        signIn({ commit }, request: SignRequest): void {
            messageBus
                .sendCommand<SignRequest>(Messages.History.SignIn, request)
                .then(response => commit("setSignInResponse", response));
        },
        signUp({ commit }, request: SignRequest): void {
            messageBus
                .sendCommand<SignRequest>(Messages.History.SignUp, request)
                .then(response => commit("setSignUpResponse", response));
        },
        signOut(): void {
            messageBus.sendCommand<void>(Messages.History.SignOut);
        },
        syncOneTime(): void {
            messageBus.sendCommand<void>(Messages.History.SyncOneTime);
        }
    }
};