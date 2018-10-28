import { Component, Prop } from "vue-property-decorator";

import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignUpResponse, SignUpResponseValidationCode } from "common/dto/history/account/SignUpResponse";

import HistoryLoginFooter from "../history-login-footer/HistoryLoginFooter.vue";
import HistoryLoginViewBase, { DataBase, ValidationResultBase } from "components/history/history-sync/history-login/HistoryLoginViewBase";

@Component({
    components: {
        HistoryLoginFooter
    }
})
export default class SignUp extends HistoryLoginViewBase<SignUpData, ValidationResult> {
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
        if (!this.data.password) {
            validationResult.password = "Password must not be empty.";
        }

        if (!this.data.passwordConfirmation) {
            validationResult.passwordConfirmation = "Password confirmation must not be empty.";
        }

        if (this.data.passwordConfirmation && this.data.password !== this.data.passwordConfirmation) {
            validationResult.password = validationResult.passwordConfirmation = "Password and password confirmation must be equal.";
        }
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
                validationResult.password = "Password is too weak, it should have at least 6 characters.";
            }
        }
    }
}

interface SignUpData extends DataBase {
    readonly password: string;
    readonly passwordConfirmation: string;
}

class ValidationResult extends ValidationResultBase {
    public password: string | null = null;
    public passwordConfirmation: string | null = null;
}