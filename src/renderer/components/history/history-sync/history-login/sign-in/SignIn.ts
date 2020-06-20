import { Component, Prop, Watch } from "vue-property-decorator";

import { SignInResponse, SignInResponseValidationCode } from "common/dto/history/account/SignInResponse";

import HistoryLoginFooter from "../history-login-footer/HistoryLoginFooter.vue";
import { SignedOutViewBase, SignedOutDataBase, SignedOutValidationResultBase } from "components/history/history-sync/history-login/base/SignedOutViewBase";
import { SignRequest } from "common/dto/history/account/SignRequest";

@Component({
    components: {
        HistoryLoginFooter
    }
})
export default class SignIn extends SignedOutViewBase<SignInData, ValidationResult> {
    @Prop(Object)
    public signInResponse!: SignInResponse | null;

    constructor() {
        super({ email: "", password: "" });
    }

    public restorePassword(): void {
        this.$emit("restore-password");
    }

    protected createEmptyValidationResult(): ValidationResult {
        return new ValidationResult();
    }

    protected validateEmptyFields(validationResult: ValidationResult): void {
        if (!this.data.password) {
            validationResult.password = "Password must not be empty.";
        }
    }

    protected validateNonEmptyFields(validationResult: ValidationResult): void {
        if (this.signInResponse !== null) {
            if (this.signInResponse.validationCode === SignInResponseValidationCode.InvalidEmail) {
                validationResult.email = "Email is invalid.";
            }

            if (this.signInResponse.validationCode === SignInResponseValidationCode.UserNotFound) {
                validationResult.email = "User with this email is not found.";
            }

            if (this.signInResponse.validationCode === SignInResponseValidationCode.InvalidPassword) {
                validationResult.password = "Password is invalid.";
            }

            if (!this.signInResponse.validationCode) {
                validationResult.email = "Unknown error. Please try again.";
            }
        }
    }

    protected confirmAction(): void {
        const signRequest: SignRequest = this.data;
        this.$emit("sign-in", signRequest);
    }
}

interface SignInData extends SignedOutDataBase {
    readonly password: string;
    readonly email: string;
}

class ValidationResult extends SignedOutValidationResultBase {
    public password: string | null = null;
}