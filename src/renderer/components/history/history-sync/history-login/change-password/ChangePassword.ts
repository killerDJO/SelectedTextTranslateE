import { Component, Prop } from "vue-property-decorator";

import { PasswordChangeRequest } from "common/dto/history/account/PasswordChangeRequest";
import { PasswordChangeResponse, PasswordChangeResponseValidationCode } from "common/dto/history/account/PasswordChangeResponse";

import HistoryLoginFooter from "../history-login-footer/HistoryLoginFooter.vue";
import { PasswordInputData, PasswordInputValidationResult, PasswordInputValidator } from "../base/PasswordInputValidator";
import { HistoryLoginViewBase, ValidationResultBase } from "components/history/history-sync/history-login/base/HistoryLoginViewBase";

@Component({
    components: {
        HistoryLoginFooter
    }
})
export default class ChangePassword extends HistoryLoginViewBase<ChangePasswordData, ValidationResult> {
    private readonly passwordInputValidator = new PasswordInputValidator();

    @Prop(Object)
    public passwordChangeResponse!: PasswordChangeResponse | null;

    constructor() {
        super({ oldPassword: "", password: "", passwordConfirmation: "" });
    }

    protected confirmAction(): void {
        const passwordChangeRequest: PasswordChangeRequest = {
            oldPassword: this.data.oldPassword,
            newPassword: this.data.password
        };
        this.$emit("change-password", passwordChangeRequest);
    }

    protected createEmptyValidationResult(): ValidationResult {
        return new ValidationResult();
    }

    protected validateEmptyFields(validationResult: ValidationResult): void {
        if (!this.data.oldPassword) {
            validationResult.oldPassword = "Current password must not be empty.";
        }

        this.passwordInputValidator.validateEmptyFields(this.data, validationResult);
    }

    protected validateNonEmptyFields(validationResult: ValidationResult): void {
        if (this.passwordChangeResponse !== null) {
            if (this.passwordChangeResponse.validationCode === PasswordChangeResponseValidationCode.WrongPassword) {
                validationResult.oldPassword = "Current password is invalid.";
            }

            if (this.passwordChangeResponse.validationCode === PasswordChangeResponseValidationCode.WeakPassword) {
                this.passwordInputValidator.addWeakPasswordResult(validationResult);
            }
        }
    }
}

interface ChangePasswordData extends PasswordInputData {
    oldPassword: string;
}

class ValidationResult extends ValidationResultBase implements PasswordInputValidationResult {
    public oldPassword: string | null = null;
    public password: string | null = null;
    public passwordConfirmation: string | null = null;
}