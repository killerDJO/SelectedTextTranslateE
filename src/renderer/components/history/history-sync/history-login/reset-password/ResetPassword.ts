import { Component } from "vue-property-decorator";

import HistoryLoginFooter from "../history-login-footer/HistoryLoginFooter.vue";
import HistoryLoginViewBase, { DataBase, ValidationResultBase } from "components/history/history-sync/history-login/HistoryLoginViewBase";

@Component({
    components: {
        HistoryLoginFooter
    }
})
export default class ResetPassword extends HistoryLoginViewBase<ResetPasswordData, ValidationResult> {

    constructor() {
        super({ email: "" });
    }

    protected confirmAction(): void {
        this.$emit("reset-password", this.data);
    }

    protected createEmptyValidationResult(): ValidationResult {
        return new ValidationResult();
    }

    protected validateEmptyFields(validationResult: ValidationResult): void {
    }

    protected validateNonEmptyFields(validationResult: ValidationResult): void {
    }
}

interface ResetPasswordData extends DataBase {
}

class ValidationResult extends ValidationResultBase {
}