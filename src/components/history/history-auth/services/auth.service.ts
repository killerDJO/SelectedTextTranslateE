import { AuthError, createClient, isAuthApiError, SupabaseClient } from '@supabase/supabase-js';

import {
  PasswordChangeErrorCodes,
  PasswordResetErrorCodes,
  SendResetTokenErrorCodes,
  SignInErrorCodes,
  SignUpErrorCodes,
  VerifyResetTokenErrorCodes,
  type AuthResponse
} from '~/components/history/history-auth/models/auth-response.model';
import type { AccountInfo } from '~/components/history/history-auth/models/account-info.model';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider.service';
import { logger, Logger } from '~/services/logger.service';

export class AuthService {
  private supabase: SupabaseClient | null = null;

  public constructor(
    private readonly settingsProvider: SettingsProvider,
    private readonly logger: Logger
  ) {}

  public async initialize(): Promise<SupabaseClient> {
    const settings = this.settingsProvider.getSettings().supabase;
    this.supabase = createClient(settings.projectUrl, settings.anonKey);

    // this.auth = new Promise(resolve => {
    //   const auth = getAuth(app);
    //   auth.setPersistence(indexedDBLocalPersistence).then(() => resolve(auth));
    // });

    return this.supabase;
  }

  public async signIn(email: string, password: string): Promise<AuthResponse<SignInErrorCodes>> {
    const supabase = await this.ensureInitialized();

    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return this.handleAuthResponse<SignInErrorCodes>(response, this.mapSignInErrorCodes);
  }

  public async signUp(email: string, password: string): Promise<AuthResponse<SignUpErrorCodes>> {
    const supabase = await this.ensureInitialized();

    const response = await supabase.auth.signUp({
      email,
      password
    });

    const authResponse = this.handleAuthResponse<SignUpErrorCodes>(
      response,
      this.mapSignUpErrorCodes
    );

    if (authResponse.isSuccessful && !response.data.session) {
      // This probably means email confirmation is enabled
      throw new Error('Session is not available after sign up');
    }

    return authResponse;
  }

  public async signOut(): Promise<void> {
    const supabase = await this.ensureInitialized();
    await supabase.auth.signOut();
  }

  public async sendPasswordResetToken(
    email: string
  ): Promise<AuthResponse<SendResetTokenErrorCodes>> {
    const supabase = await this.ensureInitialized();

    const response = await supabase.auth.resetPasswordForEmail(email);
    return this.handleAuthResponse<SendResetTokenErrorCodes>(
      response,
      this.mapSendResetTokenErrorCodes
    );
  }

  public async verifyPasswordResetToken(
    token: string
  ): Promise<AuthResponse<VerifyResetTokenErrorCodes>> {
    const supabase = await this.ensureInitialized();

    return { isSuccessful: true };
    // return this.handleAuthResponse<VerifyResetTokenErrorCodes>(
    //   verifyPasswordResetCode(auth, token),
    //   this.mapVerifyResetTokenErrorCodes
    // );
  }

  public async confirmPasswordReset(
    token: string,
    password: string
  ): Promise<AuthResponse<PasswordResetErrorCodes>> {
    const supabase = await this.ensureInitialized();

    const response = await supabase.auth.updateUser({
      nonce: token,
      password
    });

    return this.handleAuthResponse<PasswordResetErrorCodes>(
      response,
      this.mapPasswordResetErrorCodes
    );
  }

  public async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<AuthResponse<PasswordChangeErrorCodes>> {
    const supabase = await this.ensureInitialized();

    const response = await supabase.auth.updateUser({
      password: newPassword
    });

    // const currentUser = auth.currentUser;
    // if (!currentUser) {
    //   throw Error('User is not available.');
    // }

    // const credentials = EmailAuthProvider.credential(currentUser.email as string, oldPassword);
    // try {
    //   await reauthenticateWithCredential(currentUser, credentials);
    // } catch (error: unknown) {
    //   if (error instanceof FirebaseError && error.code === 'auth/wrong-password') {
    //     return {
    //       isSuccessful: false,
    //       errorCode: PasswordChangeErrorCodes.WrongPassword
    //     };
    //   }

    //   throw new Error('Unable to change password because current user is not found');
    // }

    return this.handleAuthResponse<PasswordChangeErrorCodes>(
      response,
      this.mapPasswordChangeErrorCodes
    );
  }

  public async getAccount(): Promise<AccountInfo | null> {
    const supabase = await this.ensureInitialized();
    const session = await supabase.auth.getSession();

    this.throwOnAuthError(session.error);

    if (!session.data.session) {
      return null;
    }

    if (!session.data.session.user.email) {
      throw new Error('Email is not available');
    }

    return {
      email: session.data.session.user.email.toLowerCase(),
      uid: session.data.session.user.id
    };
  }

  public async onAccountChanged(callback: (account: AccountInfo | null) => void) {
    const supabase = await this.ensureInitialized();

    supabase.auth.onAuthStateChange(async event => {
      try {
        if (event === 'SIGNED_OUT') {
          callback(null);
          return;
        }

        callback(await this.getAccount());
      } catch (error: unknown) {
        this.logger.error(error, 'Error occurred while handling auth state change');
      }
    });
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
    if (isAuthApiError(error) && error.status === 400) {
      return SignInErrorCodes.InvalidCredentials;
    }
  }

  private mapSignUpErrorCodes(error: AuthError): SignUpErrorCodes | undefined {
    if (isAuthApiError(error) && error.status === 422) {
      return SignUpErrorCodes.EmailAlreadyInUse;
    }
  }

  private mapSendResetTokenErrorCodes(error: AuthError): SendResetTokenErrorCodes | undefined {
    const responsesMap: { [key: string]: SendResetTokenErrorCodes } = {
      'auth/invalid-email': SendResetTokenErrorCodes.InvalidEmail,
      'auth/user-not-found': SendResetTokenErrorCodes.UserNotFound,
      'auth/too-many-requests': SendResetTokenErrorCodes.TooManyRequests
    };

    return responsesMap[error.code ?? ''];
  }

  private mapPasswordResetErrorCodes(error: AuthError): PasswordResetErrorCodes {
    const responsesMap: { [key: string]: PasswordResetErrorCodes } = {
      'auth/expired-action-code': PasswordResetErrorCodes.ExpiredActionCode,
      'auth/invalid-action-code': PasswordResetErrorCodes.InvalidActionCode,
      'auth/weak-password': PasswordResetErrorCodes.WeakPassword
    };

    return responsesMap[error.code ?? ''];
  }

  private mapPasswordChangeErrorCodes(error: AuthError): PasswordChangeErrorCodes {
    const responsesMap: { [key: string]: PasswordChangeErrorCodes } = {
      'auth/weak-password': PasswordChangeErrorCodes.WeakPassword
    };

    return responsesMap[error.code ?? ''];
  }

  private mapVerifyResetTokenErrorCodes(error: AuthError): VerifyResetTokenErrorCodes {
    const responsesMap: { [key: string]: VerifyResetTokenErrorCodes } = {
      'auth/expired-action-code': VerifyResetTokenErrorCodes.ExpiredToken,
      'auth/invalid-action-code': VerifyResetTokenErrorCodes.InvalidToken
    };

    return responsesMap[error.code ?? ''];
  }

  private async ensureInitialized(): Promise<SupabaseClient> {
    if (!this.supabase) {
      throw new Error("AuthService isn't initialized");
    }

    return this.supabase;
  }

  private async throwOnAuthError(error: AuthError | null | undefined) {
    if (!error) {
      return;
    }

    this.logger.error(error, `Auth error. Code: ${error?.code}.`);
    throw new Error('Authentication error occurred.');
  }
}

export const authService = new AuthService(settingsProvider, logger);
