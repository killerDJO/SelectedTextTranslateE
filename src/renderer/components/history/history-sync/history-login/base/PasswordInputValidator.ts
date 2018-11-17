export class PasswordInputValidator {

    public validateEmptyFields(data: PasswordInputData, validationResult: PasswordInputValidationResult): void {
        if (!data.password) {
            validationResult.password = "Password must not be empty.";
        }

        if (!data.passwordConfirmation) {
            validationResult.passwordConfirmation = "Password confirmation must not be empty.";
        }

        if (data.passwordConfirmation && data.password !== data.passwordConfirmation) {
            validationResult.password = validationResult.passwordConfirmation = "Password and password confirmation must be equal.";
        }
    }

    public addWeakPasswordResult(validationResult: PasswordInputValidationResult): void {
        validationResult.password = "Password is too weak, it should have at least 6 characters.";
    }
}

export interface PasswordInputData {
    readonly password: string;
    readonly passwordConfirmation: string;
}

export interface PasswordInputValidationResult {
    password: string | null;
    passwordConfirmation: string | null;
}