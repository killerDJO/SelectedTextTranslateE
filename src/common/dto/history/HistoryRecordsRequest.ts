import { SortColumn } from "common/dto/history/SortColumn";
import { SortOrder } from "common/dto/history/SortOrder";
import { HistoryFilter } from "common/dto/history/HistoryFilter";

export interface HistoryRecordsRequest {
    sortColumn: SortColumn;
    sortOrder: SortOrder;
    pageNumber: number;
    pageSize: number;
    filter: HistoryFilter;
}