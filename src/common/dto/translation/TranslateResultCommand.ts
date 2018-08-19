import { TranslateResult } from "common/dto/translation/TranslateResult";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";

export interface TranslateResultCommand {
    readonly translateResult: TranslateResult | null;
    readonly defaultView: TranslateResultViews;
}