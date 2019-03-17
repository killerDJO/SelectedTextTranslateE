export interface DataTableConfiguration {
    readonly columns: ReadonlyArray<DataTableColumnConfiguration>;
    isLoading: boolean;
    clickable?: boolean;
}

export interface DataTableColumnConfiguration {
    readonly id: string;
    weight: number;
    isVisible: boolean;
}