export interface AuthResponse<TErrorCodes> {
  readonly isSuccessful: boolean;
  readonly errorCode?: TErrorCodes | string;
}

export enum SignInErrorCodes {
  InvalidEmail = 'invalid-email',
  UserNotFound = 'user-not-found',
  InvalidPassword = 'invalid-password'
}

export enum SignUpErrorCodes {
  InvalidEmail = 'invalid-email',
  WeakPassword = 'weak-password',
  EmailAlreadyInUse = 'email-already-in-use'
}

export enum VerifyResetTokenErrorCodes {
  ExpiredToken = 'expired-token',
  InvalidToken = 'invalid-token'
}

export enum SendResetTokenErrorCodes {
  InvalidEmail = 'invalid-email',
  UserNotFound = 'user-not-found',
  TooManyRequests = 'too-many-requests'
}

export enum PasswordResetErrorCodes {
  ExpiredActionCode = 'expired-action-code',
  InvalidActionCode = 'invalid-action-code',
  WeakPassword = 'weak-password'
}

export enum PasswordChangeErrorCodes {
  WrongPassword = 'wrong-password',
  WeakPassword = 'weak-password'
}
