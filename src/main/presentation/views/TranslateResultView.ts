import { Observable, Subject } from "rxjs";

import { Messages } from "common/messaging/Messages";
import { ViewNames } from "common/ViewNames";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { StarRequest } from "common/dto/translation/StarRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { ViewOptions } from "presentation/framework/ViewOptions";

export abstract class TranslateResultView extends ViewBase {
    protected inProgressTimeout: NodeJS.Timer | null = null;

    public readonly playText$: Observable<PlayTextRequest>;
    public readonly search$: Observable<string>;
    public readonly translateText$: Observable<TranslationRequest>;
    public readonly starTranslateResult$: Observable<StarRequest>;

    constructor(viewName: ViewNames, context: ViewContext, viewOptions: ViewOptions) {
        super(viewName, context, viewOptions);

        this.messageBus.sendValue(Messages.TranslateResult.TranslationResultViewSettings, this.context.viewsSettings.translation.renderer);
        this.messageBus.sendValue(Messages.TranslateResult.Languages, this.context.settingsProvider.getLanguages());
        this.playText$ = this.messageBus.observeCommand(Messages.TranslateResult.PlayTextCommand);
        this.translateText$ = this.messageBus.observeCommand<TranslationRequest>(Messages.TranslateResult.TranslateCommand);
        this.starTranslateResult$ = this.messageBus.observeCommand<StarRequest>(Messages.TranslateResult.StarTranslateResult);
        this.search$ = this.messageBus.observeCommand<string>(Messages.TranslateResult.Search);
    }

    public showProgressIndicator(): void {
        this.messageBus.sendNotification(Messages.TranslateResult.InProgressCommand);
        this.show();
    }

    public setTranslateResult(historyRecord: HistoryRecord | null, defaultTranslateResultView: TranslateResultViews): Subject<void> {
        return this.messageBus.sendValue<TranslateResultResponse>(Messages.TranslateResult.TranslateResult, { historyRecord, defaultView: defaultTranslateResultView });
    }

    public updateTranslateResult(historyRecord: HistoryRecord): Subject<void> {
        return this.messageBus.sendValue<HistoryRecord>(Messages.TranslateResult.UpdateTranslateResult, historyRecord);
    }
}