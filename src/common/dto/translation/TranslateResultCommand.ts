import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

export interface TranslateResultResponse {
    readonly historyRecord: HistoryRecord | null;
    readonly defaultView?: TranslateResultViews;
}