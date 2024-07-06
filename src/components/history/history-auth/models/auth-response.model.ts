export interface AuthResponse<TErrorCodes> {
  readonly isSuccessful: boolean;
  readonly errorCode?: TErrorCodes | string;
}

export enum SignInErrorCodes {
  TooManyRequests = 'too-many-requests'
}

export enum VerifyOTPErrorCodes {
  InvalidOTP = 'invalid-otp'
}
