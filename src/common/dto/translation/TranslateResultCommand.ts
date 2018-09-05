import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

export interface TranslateResultCommand {
    readonly historyRecord: HistoryRecord | null;
    readonly defaultView?: TranslateResultViews;
}