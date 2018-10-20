export interface SignResponse<TValidationCode> {
    readonly isSuccessful: boolean;
    readonly validationCode?: TValidationCode;
}