import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";

export interface HistoryRecordsRequest {
    sortColumn: SortColumn;
    sortOrder: SortOrder;
    pageNumber: number;
    starredOnly: boolean;
    includeArchived: boolean;
}