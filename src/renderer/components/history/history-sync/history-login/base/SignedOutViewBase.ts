import { HistoryLoginViewBase, ValidationResultBase } from "./HistoryLoginViewBase";

export abstract class SignedOutViewBase<TData extends SignedOutDataBase, TValidationResult extends SignedOutValidationResultBase> extends HistoryLoginViewBase<TData, TValidationResult> {

    protected validateNonEmptyFields(validationResult: SignedOutValidationResultBase): void {
        if (!this.data.email) {
            validationResult.email = "Email must not be empty.";
        }
    }
}

export interface SignedOutDataBase {
    email: string;
}

export class SignedOutValidationResultBase extends ValidationResultBase {
    public email: string | null = null;
}