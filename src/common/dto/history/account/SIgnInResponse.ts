import { AuthResponse } from "common/dto/history/account/AuthResponse";

export interface SignInResponse extends AuthResponse<SignInResponseValidationCode> {
}

export enum SignInResponseValidationCode {
    InvalidEmail = "invalid-email",
    UserNotFound = "user-not-found",
    InvalidPassword = "invalid-password"
}