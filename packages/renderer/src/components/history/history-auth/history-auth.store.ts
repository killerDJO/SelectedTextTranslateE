import { defineStore } from 'pinia';

import { historyCache } from '~/components/history/services/history-cache';

import type { AccountInfo } from './models/account-info';
import type {
  AuthResponse,
  PasswordChangeErrorCodes,
  PasswordResetErrorCodes,
  SendResetTokenErrorCodes,
  SignInErrorCodes,
  SignUpErrorCodes,
  VerifyResetTokenErrorCodes
} from './models/auth-response';
import { authService } from './services/auth-service';

interface HistoryAuthState {
  account: AccountInfo | null;
  isSetupInProgress: boolean;
}

export const useHistoryAuthStore = defineStore('history-auth', {
  state: () => {
    const state: HistoryAuthState = {
      account: null,
      isSetupInProgress: false
    };
    return state;
  },
  getters: {
    isSignedIn: state => !!state.account
  },
  actions: {
    async setup() {
      try {
        this.isSetupInProgress = true;

        await authService.initialize();

        this.account = await authService.getAccount();
        await authService.onAccountChanged(account => (this.account = account));
      } finally {
        this.isSetupInProgress = false;
      }
    },
    signIn(email: string, password: string): Promise<AuthResponse<SignInErrorCodes>> {
      return authService.signIn(email, password);
    },
    signOut() {
      historyCache.clearUserData(this.account!.uid);
      return authService.signOut();
    },
    signUp(email: string, password: string): Promise<AuthResponse<SignUpErrorCodes>> {
      return authService.signUp(email, password);
    },
    sendPasswordResetToken(email: string): Promise<AuthResponse<SendResetTokenErrorCodes>> {
      return authService.sendPasswordResetToken(email);
    },
    verifyPasswordResetToken(token: string): Promise<AuthResponse<VerifyResetTokenErrorCodes>> {
      return authService.verifyPasswordResetToken(token);
    },
    confirmPasswordReset(
      token: string,
      password: string
    ): Promise<AuthResponse<PasswordResetErrorCodes>> {
      return authService.confirmPasswordReset(token, password);
    },
    changePassword(
      oldPassword: string,
      newPassword: string
    ): Promise<AuthResponse<PasswordChangeErrorCodes>> {
      return authService.changePassword(oldPassword, newPassword);
    }
  }
});
