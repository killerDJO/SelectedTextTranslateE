import { Component, Prop } from "vue-property-decorator";

import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignUpResponse, SignUpResponseValidationCode } from "common/dto/history/account/SignUpResponse";

import HistoryLoginFooter from "../history-login-footer/HistoryLoginFooter.vue";
import { SignedOutViewBase, SignedOutDataBase, SignedOutValidationResultBase } from "components/history/history-sync/history-login/base/SignedOutViewBase";
import { PasswordInputData, PasswordInputValidationResult, PasswordInputValidator } from "components/history/history-sync/history-login/base/PasswordInputValidator";

@Component({
    components: {
        HistoryLoginFooter
    }
})
export default class SignUp extends SignedOutViewBase<SignUpData, ValidationResult> {

    private readonly passwordInputValidator = new PasswordInputValidator();

    @Prop(Object)
    public signUpResponse!: SignUpResponse | null;

    constructor() {
        super({ email: "", password: "", passwordConfirmation: "" });
    }

    protected confirmAction(): void {
        const signRequest: SignRequest = this.data;
        this.$emit("sign-up", signRequest);
    }

    protected createEmptyValidationResult(): ValidationResult {
        return new ValidationResult();
    }

    protected validateEmptyFields(validationResult: ValidationResult): void {
        this.passwordInputValidator.validateEmptyFields(this.data, validationResult);
    }

    protected validateNonEmptyFields(validationResult: ValidationResult): void {
        if (this.signUpResponse !== null) {
            if (this.signUpResponse.validationCode === SignUpResponseValidationCode.InvalidEmail) {
                validationResult.email = "Email is invalid.";
            }

            if (this.signUpResponse.validationCode === SignUpResponseValidationCode.EmailAlreadyInUse) {
                validationResult.email = "User with this email is already registered.";
            }

            if (this.signUpResponse.validationCode === SignUpResponseValidationCode.WeakPassword) {
                this.passwordInputValidator.addWeakPasswordResult(validationResult);
            }
        }
    }
}

interface SignUpData extends SignedOutDataBase, PasswordInputData {
}

class ValidationResult extends SignedOutValidationResultBase implements PasswordInputValidationResult {
    public password: string | null = null;
    public passwordConfirmation: string | null = null;
}