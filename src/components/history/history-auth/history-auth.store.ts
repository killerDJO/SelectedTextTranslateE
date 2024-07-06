import { defineStore } from 'pinia';

import { historyCache } from '~/components/history/services/history-cache.service';

import type { AccountInfo } from './models/account-info.model';
import type {
  AuthResponse,
  SignInErrorCodes,
  VerifyOTPErrorCodes
} from './models/auth-response.model';
import { authService } from './services/auth.service';

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

        this.account = await authService.getAccount();
        await authService.onAccountChanged(account => (this.account = account));
      } finally {
        this.isSetupInProgress = false;
      }
    },
    signInWithOTP(email: string): Promise<AuthResponse<SignInErrorCodes>> {
      return authService.signInWithOTP(email);
    },
    verifyOTPAndLogin(email: string, otp: string): Promise<AuthResponse<VerifyOTPErrorCodes>> {
      return authService.verifyOTPAndLogin(email, otp);
    },
    signOut() {
      historyCache.clearUserData(this.account!.uid);
      return authService.signOut();
    }
  }
});
