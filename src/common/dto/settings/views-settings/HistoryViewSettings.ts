import { SortColumn } from "common/dto/history/SortColumn";

export interface HistoryViewRendererSettings {
    readonly pageSize: number;
    readonly columns: ReadonlyArray<ColumnSettings>;
}

export interface ColumnSettings {
    column: SortColumn;
    isVisible: boolean;
    weight: number;
}