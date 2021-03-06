import { Vue, Watch } from "vue-property-decorator";

export abstract class HistoryLoginViewBase<TData, TValidationResult extends ValidationResultBase> extends Vue {
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

export class ValidationResultBase {
    [key: string]: string | null;
}