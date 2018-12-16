import { Module } from "vuex";

import { RootState } from "root.store";

import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import { SignRequest } from "common/dto/history/account/SignRequest";
import { PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";
import { PasswordChangeRequest } from "common/dto/history/account/PasswordChangeRequest";
import { PasswordChangeResponse } from "common/dto/history/account/PasswordChangeResponse";

const messageBus = new MessageBus();

interface HistorySyncState {

    isSyncInProgress: boolean;

    signInResponse: SignInResponse | null;
    signUpResponse: SignUpResponse | null;
    sendResetTokenResponse: SendResetTokenResponse | null;
    passwordResetResponse: PasswordResetResponse | null;
    verifyResetTokenResponse: VerifyResetTokenResponse | null;
    passwordChangeResponse: PasswordChangeResponse | null;
}

export const historySync: Module<HistorySyncState, RootState> = {
    namespaced: true,
    state: {
        isSyncInProgress: false,
        signInResponse: null,
        signUpResponse: null,
        sendResetTokenResponse: null,
        passwordResetResponse: null,
        passwordChangeResponse: null,
        verifyResetTokenResponse: null
    },
    mutations: {
        setSyncStatus(state: HistorySyncState, isSyncInProgress: boolean): void {
            state.isSyncInProgress = isSyncInProgress;
        },
        setSignInResponse(state: HistorySyncState, signInResponse: SignInResponse | null): void {
            state.signInResponse = signInResponse;
        },
        setSignUpResponse(state: HistorySyncState, signUpResponse: SignUpResponse | null): void {
            state.signUpResponse = signUpResponse;
        },
        setSendResetTokenResponse(state: HistorySyncState, sendResetTokenResponse: SendResetTokenResponse | null): void {
            state.sendResetTokenResponse = sendResetTokenResponse;
        },
        setVerifyResetTokenResponse(state: HistorySyncState, verifyResetTokenResponse: VerifyResetTokenResponse | null): void {
            state.verifyResetTokenResponse = verifyResetTokenResponse;
        },
        setPasswordResetResponse(state: HistorySyncState, passwordResetResponse: PasswordResetResponse | null): void {
            state.passwordResetResponse = passwordResetResponse;
        },
        setPasswordChangeResponse(state: HistorySyncState, passwordChangeResponse: PasswordChangeResponse | null): void {
            state.passwordChangeResponse = passwordChangeResponse;
        }
    },
    actions: {
        setup({ commit }): void {
            messageBus.observeValue<AccountInfo | null>(Messages.History.SyncState, isSyncInProgress => commit("setSyncStatus", isSyncInProgress));

        },
        resetResponses({ commit }): void {
            commit("setSignInResponse", null);
            commit("setSignUpResponse", null);
            commit("setVerifyResetTokenResponse", null);
            commit("setPasswordResetResponse", null);
            commit("setSendResetTokenResponse", null);
            commit("setPasswordChangeResponse", null);
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
        sendPasswordResetToken({ commit }, email: string): void {
            messageBus
                .sendCommand<string>(Messages.History.SendPasswordResetToken, email)
                .then(response => commit("setSendResetTokenResponse", response));
        },
        verifyPasswordResetToken({ commit }, token: string): void {
            messageBus
                .sendCommand<string>(Messages.History.VerifyPasswordResetToken, token)
                .then(response => commit("setVerifyResetTokenResponse", response));
        },
        resetPassword({ commit }, request: PasswordResetRequest): void {
            messageBus
                .sendCommand<PasswordResetRequest>(Messages.History.ResetPassword, request)
                .then(response => commit("setPasswordResetResponse", response));
        },
        changePassword({ commit }, request: PasswordChangeRequest): void {
            messageBus
                .sendCommand<PasswordChangeRequest>(Messages.History.ChangePassword, request)
                .then(response => commit("setPasswordChangeResponse", response));
        },
        signOut(): void {
            messageBus.sendCommand<void>(Messages.History.SignOut);
        },
        syncOneTime(): void {
            messageBus.sendCommand<void>(Messages.History.SyncOneTime);
        },
        syncOneTimeForced(): void {
            messageBus.sendCommand<void>(Messages.History.SyncOneTimeForced);
        },
        showHistorySettings(): void {
            messageBus.sendCommand<void>(Messages.History.ShowHistorySettings);
        }
    }
};