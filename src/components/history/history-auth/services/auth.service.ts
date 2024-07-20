import { AuthError, isAuthApiError, Session } from '@supabase/supabase-js';

import {
  SignInErrorCodes,
  VerifyOTPErrorCodes,
  type AuthResponse
} from '~/components/history/history-auth/models/auth-response.model';
import type { AccountInfo } from '~/components/history/history-auth/models/account-info.model';
import { logger, Logger } from '~/services/logger.service';
import { supabaseProvider, SupabaseProvider } from '~/services/supabase-provider.service';

export class AuthService {
  public constructor(
    private readonly supabaseProvider: SupabaseProvider,
    private readonly logger: Logger
  ) {}

  public async signInWithOTP(email: string): Promise<AuthResponse<SignInErrorCodes>> {
    const supabase = await this.supabaseProvider.getClient();

    const response = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });

    return this.handleAuthResponse<SignInErrorCodes>(response, this.mapSignInErrorCodes);
  }

  public async verifyOTPAndLogin(
    email: string,
    otp: string
  ): Promise<AuthResponse<VerifyOTPErrorCodes>> {
    const supabase = await this.supabaseProvider.getClient();

    const response = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    return this.handleAuthResponse<VerifyOTPErrorCodes>(response, this.mapVerifyOtpErrorCodes);
  }

  public async signOut(): Promise<void> {
    const supabase = await this.supabaseProvider.getClient();
    await supabase.auth.signOut();
  }

  public async getAccount(): Promise<AccountInfo | null> {
    const supabase = await this.supabaseProvider.getClient();
    const session = await supabase.auth.getSession();

    this.throwOnAuthError(session.error);

    return this.mapAccountFromSession(session.data.session);
  }

  public async onAccountChanged(callback: (account: AccountInfo | null) => void) {
    const supabase = await this.supabaseProvider.getClient();

    supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'USER_UPDATED') {
          return;
        }

        if (event === 'SIGNED_OUT') {
          callback(null);
          return;
        }

        callback(this.mapAccountFromSession(session));
      } catch (error: unknown) {
        this.logger.error(error, 'Error occurred while handling auth state change');
      }
    });
  }

  private mapAccountFromSession(session: Session | null): AccountInfo | null {
    if (!session) {
      return null;
    }

    if (!session.user.email) {
      throw new Error('Email is not available');
    }

    return {
      email: session.user.email.toLowerCase(),
      uid: session.user.id
    };
  }

  private handleAuthResponse<TErrorCodes>(
    response: { data: unknown; error: AuthError | null },
    errorMapper: (error: AuthError) => TErrorCodes | undefined
  ): AuthResponse<TErrorCodes> {
    if (response.error) {
      const customErrorCode = errorMapper(response.error);
      if (!customErrorCode) {
        throw response.error;
      }

      return {
        isSuccessful: false,
        errorCode: customErrorCode
      };
    } else {
      return {
        isSuccessful: true
      };
    }
  }

  private mapSignInErrorCodes(error: AuthError): SignInErrorCodes | undefined {
    if (!isAuthApiError(error)) {
      return;
    }

    if (error.status === 429) {
      return SignInErrorCodes.TooManyRequests;
    }
  }

  private mapVerifyOtpErrorCodes(error: AuthError): VerifyOTPErrorCodes | undefined {
    if (isAuthApiError(error) && error.status === 403) {
      return VerifyOTPErrorCodes.InvalidOTP;
    }
  }

  private async throwOnAuthError(error: AuthError | null | undefined) {
    if (!error) {
      return;
    }

    this.logger.error(error, `Auth error. Code: ${error?.code}.`);
    throw new Error('Authentication error occurred.');
  }
}

export const authService = new AuthService(supabaseProvider, logger);
