import { Component, Prop, Watch } from "vue-property-decorator";

import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { PasswordResetResponseValidationCode, PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { SendResetTokenResponseValidationCode, SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponseValidationCode, VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";

import HistoryLoginFooter from "../history-login-footer/HistoryLoginFooter.vue";
import HistoryLoginViewBase, { DataBase, ValidationResultBase } from "components/history/history-sync/history-login/HistoryLoginViewBase";

@Component({
    components: {
        HistoryLoginFooter
    }
})
export default class ResetPassword extends HistoryLoginViewBase<ResetPasswordData, ValidationResult> {

    @Prop(Object)
    public sendResetTokenResponse!: SendResetTokenResponse | null;

    @Prop(Object)
    public passwordResetResponse!: PasswordResetResponse | null;

    @Prop(Object)
    public verifyResetTokenResponse!: VerifyResetTokenResponse | null;

    public currentStep: ResetPasswordStep = ResetPasswordStep.Email;
    public ResetPasswordStep: typeof ResetPasswordStep = ResetPasswordStep;

    constructor() {
        super({ email: "", token: "", password: "", passwordConfirmation: "" });
    }

    @Watch("sendResetTokenResponse")
    public onSendResetTokenResponseChanged() {
        if (this.sendResetTokenResponse !== null && this.sendResetTokenResponse.isSuccessful) {
            this.currentStep = ResetPasswordStep.Token;
        }
    }

    @Watch("verifyResetTokenResponse")
    public onVerifyResetTokenResponseChanged() {
        if (this.verifyResetTokenResponse !== null && this.verifyResetTokenResponse.isSuccessful) {
            this.currentStep = ResetPasswordStep.Password;
        }
    }

    @Watch("currentStep")
    public onCurrentStepChanged() {
        this.shouldValidateEmptyFields = false;
    }

    public get confirmText(): string {
        const confirmTextMap: { [key: string]: string } = {
            [ResetPasswordStep.Email]: "Send Email",
            [ResetPasswordStep.Token]: "Verify Token",
            [ResetPasswordStep.Password]: "Change Password"
        };

        return confirmTextMap[this.currentStep];
    }

    public get isEmailDisabled(): boolean {
        return this.currentStep !== ResetPasswordStep.Email;
    }

    public changeEmail(): void {
        this.currentStep = ResetPasswordStep.Email;
        this.resetResponses();
    }

    public resendEmail(): void {
        this.sendPasswordResetToken();
    }

    protected confirmAction(): void {
        if (this.currentStep === ResetPasswordStep.Email) {
            this.sendPasswordResetToken();
        }

        if (this.currentStep === ResetPasswordStep.Token) {
            this.verifyPasswordResetToken();
        }

        if (this.currentStep === ResetPasswordStep.Password) {
            this.resetPassword();
        }
    }

    protected createEmptyValidationResult(): ValidationResult {
        return new ValidationResult();
    }

    protected validateEmptyFields(validationResult: ValidationResult): void {
        if (this.currentStep === ResetPasswordStep.Token) {
            if (!this.data.token) {
                validationResult.token = "Confirmation Token must not be empty.";
            }
        } else if (this.currentStep === ResetPasswordStep.Password) {
            if (!this.data.password) {
                validationResult.password = "Password must not be empty.";
            }

            if (!this.data.passwordConfirmation) {
                validationResult.passwordConfirmation = "Password confirmation must not be empty.";
            }
        }
    }

    protected validateNonEmptyFields(validationResult: ValidationResult): void {
        if (this.currentStep === ResetPasswordStep.Email && this.sendResetTokenResponse !== null) {
            if (this.sendResetTokenResponse.validationCode === SendResetTokenResponseValidationCode.InvalidEmail) {
                validationResult.email = "Email is invalid.";
            }

            if (this.sendResetTokenResponse.validationCode === SendResetTokenResponseValidationCode.UserNotFound) {
                validationResult.email = "User with this email is not found.";
            }

            if (this.sendResetTokenResponse.validationCode === SendResetTokenResponseValidationCode.TooManyRequests) {
                validationResult.email = "Too many requests for this email. Try again later.";
            }
        }

        if (this.currentStep === ResetPasswordStep.Token && this.verifyResetTokenResponse !== null) {
            if (this.verifyResetTokenResponse.validationCode === VerifyResetTokenResponseValidationCode.InvalidToken) {
                validationResult.token = "Token is invalid.";
            }

            if (this.verifyResetTokenResponse.validationCode === VerifyResetTokenResponseValidationCode.ExpiredToken) {
                validationResult.token = "Token is expired.";
            }
        }

        if (this.currentStep === ResetPasswordStep.Password) {
            if (this.data.passwordConfirmation && this.data.password !== this.data.passwordConfirmation) {
                validationResult.password = validationResult.passwordConfirmation = "Password and password confirmation must be equal.";
            }

            if (this.passwordResetResponse !== null) {
                if (this.passwordResetResponse.validationCode === PasswordResetResponseValidationCode.ExpiredActionCode) {
                    validationResult.password = "Token has expired. Repeat the password reset procedure.";
                }
                if (this.passwordResetResponse.validationCode === PasswordResetResponseValidationCode.InvalidActionCode) {
                    validationResult.password = "Token is invalid. Repeat the password reset procedure.";
                }
                if (this.passwordResetResponse.validationCode === PasswordResetResponseValidationCode.WeakPassword) {
                    validationResult.password = "Password is too weak.";
                }
            }
        }
    }

    private sendPasswordResetToken(): void {
        this.$emit("send-password-reset-token", this.data.email);
    }

    private resetPassword(): void {
        const request: PasswordResetRequest = { password: this.data.password, token: this.data.token };
        this.$emit("reset-password", request);
    }

    private verifyPasswordResetToken(): void {
        this.$emit("verify-password-reset-token", this.data.token);
    }
}

enum ResetPasswordStep {
    Email = "email",
    Token = "token",
    Password = "password"
}

interface ResetPasswordData extends DataBase {
    readonly token: string;
    readonly password: string;
    readonly passwordConfirmation: string;
}

class ValidationResult extends ValidationResultBase {
    public token: string | null = null;
    public password: string | null = null;
    public passwordConfirmation: string | null = null;
}