import { AuthResponse } from "common/dto/history/account/AuthResponse";

export interface PasswordChangeResponse extends AuthResponse<PasswordChangeResponseValidationCode> {
}

export enum PasswordChangeResponseValidationCode {
    WrongPassword = "wrong-password",
    WeakPassword = "weak-password"
}