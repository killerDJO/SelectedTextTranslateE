import { initializeApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  indexedDBLocalPersistence
} from 'firebase/auth';
import 'firebase/firestore';

import {
  PasswordChangeErrorCodes,
  PasswordResetErrorCodes,
  SendResetTokenErrorCodes,
  SignInErrorCodes,
  SignUpErrorCodes,
  VerifyResetTokenErrorCodes,
  type AuthResponse
} from '~/components/history/history-auth/models/auth-response';
import type { AccountInfo } from '~/components/history/history-auth/models/account-info';
import { settingsProvider, SettingsProvider } from '~/services/settings-provider';

export class AuthService {
  private auth: Promise<Auth> | null = null;

  public constructor(private readonly settingsProvider: SettingsProvider) {}

  public async initialize(): Promise<Auth> {
    const settings = this.settingsProvider.getSettings().firebase;
    const app = initializeApp({
      apiKey: settings.apiKey,
      authDomain: settings.authDomain,
      projectId: settings.projectId
    });

    this.auth = new Promise(resolve => {
      const auth = getAuth(app);
      auth.setPersistence(indexedDBLocalPersistence).then(() => resolve(auth));
    });

    return this.auth;
  }

  public async onAccountChanged(callback: (account: AccountInfo | null) => void) {
    const auth = await this.ensureInitialized();

    auth.onAuthStateChanged(() => {
      callback(this.mapAccountInfo(auth));
    });
  }

  public async getAccount(): Promise<AccountInfo | null> {
    const auth = await this.ensureInitialized();

    return this.mapAccountInfo(auth);
  }

  public async signIn(email: string, password: string): Promise<AuthResponse<SignInErrorCodes>> {
    const auth = await this.ensureInitialized();

    return this.handleAuthResponse<SignInErrorCodes>(
      signInWithEmailAndPassword(auth, email, password),
      this.mapSignInErrorCodes
    );
  }

  public async signUp(email: string, password: string): Promise<AuthResponse<SignUpErrorCodes>> {
    const auth = await this.ensureInitialized();

    return this.handleAuthResponse<SignUpErrorCodes>(
      createUserWithEmailAndPassword(auth, email, password),
      this.mapSignUpErrorCodes
    );
  }

  public async signOut(): Promise<void> {
    const auth = await this.ensureInitialized();
    return signOut(auth);
  }

  public async sendPasswordResetToken(
    email: string
  ): Promise<AuthResponse<SendResetTokenErrorCodes>> {
    const auth = await this.ensureInitialized();

    return this.handleAuthResponse<SendResetTokenErrorCodes>(
      sendPasswordResetEmail(auth, email),
      this.mapSendResetTokenErrorCodes
    );
  }

  public async verifyPasswordResetToken(
    token: string
  ): Promise<AuthResponse<VerifyResetTokenErrorCodes>> {
    const auth = await this.ensureInitialized();

    return this.handleAuthResponse<VerifyResetTokenErrorCodes>(
      verifyPasswordResetCode(auth, token),
      this.mapVerifyResetTokenErrorCodes
    );
  }

  public async confirmPasswordReset(
    token: string,
    password: string
  ): Promise<AuthResponse<PasswordResetErrorCodes>> {
    const auth = await this.ensureInitialized();

    return this.handleAuthResponse<PasswordResetErrorCodes>(
      confirmPasswordReset(auth, token, password),
      this.mapPasswordResetErrorCodes
    );
  }

  public async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<AuthResponse<PasswordChangeErrorCodes>> {
    const auth = await this.ensureInitialized();

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw Error('User is not available.');
    }

    const credentials = EmailAuthProvider.credential(currentUser.email as string, oldPassword);
    try {
      await reauthenticateWithCredential(currentUser, credentials);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        return {
          isSuccessful: false,
          errorCode: PasswordChangeErrorCodes.WrongPassword
        };
      }

      throw new Error('Unable to change password because current user is not found');
    }

    return this.handleAuthResponse<PasswordChangeErrorCodes>(
      updatePassword(currentUser, newPassword),
      this.mapPasswordChangeErrorCodes
    );
  }

  private mapAccountInfo(auth: Auth): AccountInfo | null {
    const user = auth.currentUser;
    if (user === null || !user.email) {
      return null;
    }

    return {
      email: user.email.toLowerCase(),
      uid: user.uid
    };
  }

  private async handleAuthResponse<TErrorCodes>(
    response: Promise<any>,
    errorCodeMapper: (errorCode: string) => TErrorCodes
  ): Promise<AuthResponse<TErrorCodes>> {
    try {
      await response;
      return { isSuccessful: true };
    } catch (error: any) {
      return {
        isSuccessful: false,
        errorCode: errorCodeMapper(error.code) ?? error.code
      };
    }
  }

  private mapSignInErrorCodes(code: string): SignInErrorCodes {
    const responsesMap: { [key: string]: SignInErrorCodes } = {
      'auth/invalid-email': SignInErrorCodes.InvalidEmail,
      'auth/user-not-found': SignInErrorCodes.UserNotFound,
      'auth/wrong-password': SignInErrorCodes.InvalidPassword
    };

    return responsesMap[code];
  }

  private mapSignUpErrorCodes(code: string): SignUpErrorCodes {
    const responsesMap: { [key: string]: SignUpErrorCodes } = {
      'auth/invalid-email': SignUpErrorCodes.InvalidEmail,
      'auth/weak-password': SignUpErrorCodes.WeakPassword,
      'auth/email-already-in-use': SignUpErrorCodes.EmailAlreadyInUse
    };

    return responsesMap[code];
  }

  private mapSendResetTokenErrorCodes(code: string): SendResetTokenErrorCodes {
    const responsesMap: { [key: string]: SendResetTokenErrorCodes } = {
      'auth/invalid-email': SendResetTokenErrorCodes.InvalidEmail,
      'auth/user-not-found': SendResetTokenErrorCodes.UserNotFound,
      'auth/too-many-requests': SendResetTokenErrorCodes.TooManyRequests
    };

    return responsesMap[code];
  }

  private mapPasswordResetErrorCodes(code: string): PasswordResetErrorCodes {
    const responsesMap: { [key: string]: PasswordResetErrorCodes } = {
      'auth/expired-action-code': PasswordResetErrorCodes.ExpiredActionCode,
      'auth/invalid-action-code': PasswordResetErrorCodes.InvalidActionCode,
      'auth/weak-password': PasswordResetErrorCodes.WeakPassword
    };

    return responsesMap[code];
  }

  private mapPasswordChangeErrorCodes(code: string): PasswordChangeErrorCodes {
    const responsesMap: { [key: string]: PasswordChangeErrorCodes } = {
      'auth/weak-password': PasswordChangeErrorCodes.WeakPassword
    };

    return responsesMap[code];
  }

  private mapVerifyResetTokenErrorCodes(code: string): VerifyResetTokenErrorCodes {
    const responsesMap: { [key: string]: VerifyResetTokenErrorCodes } = {
      'auth/expired-action-code': VerifyResetTokenErrorCodes.ExpiredToken,
      'auth/invalid-action-code': VerifyResetTokenErrorCodes.InvalidToken
    };

    return responsesMap[code];
  }

  private async ensureInitialized(): Promise<Auth> {
    if (!this.auth) {
      throw new Error("AuthService isn't initialized");
    }

    return this.auth;
  }
}

export const authService = new AuthService(settingsProvider);
