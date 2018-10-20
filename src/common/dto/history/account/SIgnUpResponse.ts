import { SignResponse } from "common/dto/history/account/SignResponse";

export interface SignUpResponse extends SignResponse<SignUpResponseValidationCode> {
}

export enum SignUpResponseValidationCode {
    InvalidEmail = "invalid-email",
    WeakPassword = "weak-password",
    EmailAlreadyInUse = "email-already-in-use"
}