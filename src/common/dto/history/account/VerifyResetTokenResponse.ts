import { AuthResponse } from "common/dto/history/account/AuthResponse";

export interface VerifyResetTokenResponse extends AuthResponse<VerifyResetTokenResponseValidationCode> {
}

export enum VerifyResetTokenResponseValidationCode {
    ExpiredToken = "expired-token",
    InvalidToken = "invalid-token"
}