import { AuthResponse } from "common/dto/history/account/AuthResponse";

export interface SendResetTokenResponse extends AuthResponse<SendResetTokenResponseValidationCode> {
}

export enum SendResetTokenResponseValidationCode {
    InvalidEmail = "invalid-email",
    UserNotFound = "user-not-found",
    TooManyRequests = "too-many-requests",
}