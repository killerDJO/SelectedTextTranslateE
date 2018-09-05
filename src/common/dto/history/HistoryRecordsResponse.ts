import { HistoryRecord } from "common/dto/history/HistoryRecord";

export interface HistoryRecordsResponse {
    readonly records: ReadonlyArray<HistoryRecord>
    readonly pageNumber: number;
    readonly pageSize: number;
    readonly totalRecords: number;
}