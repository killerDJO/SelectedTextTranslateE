import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";

export interface HistoryRecordsRequest {
    sortColumn: SortColumn;
    sortOrder: SortOrder;
    limit: number;
}