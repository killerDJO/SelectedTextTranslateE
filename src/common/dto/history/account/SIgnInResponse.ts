import { SignResponse } from "common/dto/history/account/SignResponse";

export interface SignInResponse extends SignResponse<SignInResponseValidationCode> {
}

export enum SignInResponseValidationCode {
    InvalidEmail = "invalid-email",
    NotRegisteredEmail = "not-registered - email",
    InvalidPassword = "invalid-password"
}