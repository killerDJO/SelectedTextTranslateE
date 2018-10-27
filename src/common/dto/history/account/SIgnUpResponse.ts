import { AuthResponse } from "common/dto/history/account/AuthResponse";

export interface SignUpResponse extends AuthResponse<SignUpResponseValidationCode> {
}

export enum SignUpResponseValidationCode {
    InvalidEmail = "invalid-email",
    WeakPassword = "weak-password",
    EmailAlreadyInUse = "email-already-in-use"
}