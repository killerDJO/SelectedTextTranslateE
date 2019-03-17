export interface DataTableConfiguration<TRecord> {
    readonly columns: ReadonlyArray<DataTableColumnConfiguration>;
    isLoading: boolean;
}

export interface DataTableColumnConfiguration {
    readonly id: string;
    weight: number;
    isVisible: boolean;
}