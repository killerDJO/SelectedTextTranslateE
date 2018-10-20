import { Vue, Component, Watch } from "vue-property-decorator";

export default abstract class HistoryLoginViewBase<TData extends DataBase, TValidationResult extends ValidationResultBase> extends Vue {
    protected shouldValidateEmptyFields: boolean = false;
    protected data: TData;

    constructor(data: TData) {
        super();
        this.data = data;
    }

    public close(): void {
        this.$emit("close");
    }

    public resetResponses(): void {
        this.$emit("reset-responses");
    }

    @Watch("data", { deep: true })
    public onDataChanged(): void {
        this.resetResponses();
    }

    public get validationResult(): TValidationResult {
        const validationResult = this.createEmptyValidationResult();

        if (this.shouldValidateEmptyFields) {
            if (!this.data.email) {
                validationResult.email = "Email must not be empty";
            }

            this.validateEmptyFields(validationResult);
        }

        this.validateNonEmptyFields(validationResult);

        return validationResult;
    }

    public isValid(): boolean {
        const validationResult = this.validationResult;
        return Object.keys(validationResult).every(result => validationResult[result] === null);
    }

    public confirmIfValid(): void {
        this.shouldValidateEmptyFields = true;

        if (this.isValid()) {
            this.confirmAction();
        }
    }

    protected abstract createEmptyValidationResult(): TValidationResult;
    protected abstract validateEmptyFields(validationResult: TValidationResult): void;
    protected abstract validateNonEmptyFields(validationResult: TValidationResult): void;
    protected abstract confirmAction(): void;
}

export interface DataBase {
    email: string;
}

export class ValidationResultBase {
    [key: string]: string | null;

    public email: string | null = null;
}