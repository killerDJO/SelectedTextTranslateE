export interface AuthResponse<TValidationCode> {
    readonly isSuccessful: boolean;
    readonly validationCode?: TValidationCode;
}