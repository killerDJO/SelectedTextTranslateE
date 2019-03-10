export interface DataTableConfiguration<TRecord> {
    readonly columns: ReadonlyArray<DataTableColumnConfiguration>;
    readonly onRecordClick: (record: TRecord) => void;
}

export interface DataTableColumnConfiguration {
    readonly id: string;
    weight: number;
    isVisible: boolean;
}