import { AuthResponse } from "common/dto/history/account/AuthResponse";

export interface PasswordResetResponse extends AuthResponse<PasswordResetResponseValidationCode> {
}

export enum PasswordResetResponseValidationCode {
    ExpiredActionCode = "expired-action-code",
    InvalidActionCode = "invalid-action-code",
    WeakPassword = "weak-password"
}