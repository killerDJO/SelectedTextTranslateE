import { Observable, Subject } from "rxjs";

import { Messages } from "common/messaging/Messages";
import { ViewNames } from "common/ViewNames";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { StarRequest } from "common/dto/translation/StarRequest";
import { UpdateTagsRequest } from "common/dto/translation/UpdateTagsRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultResponse } from "common/dto/translation/TranslateResultResponse";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { ViewOptions } from "presentation/framework/ViewOptions";
import { map } from "rxjs/operators";
import { TranslationKey } from "common/dto/translation/TranslationKey";

export abstract class TranslateResultView extends ViewBase {
    public readonly playText$: Observable<PlayTextRequest>;
    public readonly search$: Observable<string>;
    public readonly archive$: Observable<TranslationKey>;
    public readonly translateText$: Observable<TranslationRequest>;
    public readonly starTranslateResult$: Observable<StarRequest>;
    public readonly updateTags$: Observable<UpdateTagsRequest>;

    constructor(viewName: ViewNames, context: ViewContext, viewOptions: ViewOptions) {
        super(viewName, context, viewOptions);

        this.messageBus.sendValue(Messages.TranslateResult.Languages, this.context.settingsProvider.getLanguages());

        const translationRendererSettings: Observable<TranslateResultRendererSettings> = this.context.settingsProvider.getSettings().pipe(map(settings => settings.views.translation.renderer));
        this.registerSubscription(this.messageBus.registerObservable(Messages.TranslateResult.TranslationResultViewSettings, translationRendererSettings).subscription);

        this.playText$ = this.messageBus.observeCommand(Messages.TranslateResult.PlayTextCommand);
        this.translateText$ = this.messageBus.observeCommand<TranslationRequest>(Messages.TranslateResult.TranslateCommand);
        this.starTranslateResult$ = this.messageBus.observeCommand<StarRequest>(Messages.TranslateResult.StarTranslateResult);
        this.updateTags$ = this.messageBus.observeCommand<UpdateTagsRequest>(Messages.TranslateResult.UpdateTags);
        this.search$ = this.messageBus.observeCommand<string>(Messages.TranslateResult.Search);
        this.archive$ = this.messageBus.observeCommand<TranslationKey>(Messages.TranslateResult.ArchiveResult);
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

    public handleGetTagSuggestions(handler: (input: string) => Observable<ReadonlyArray<string>>): void {
        this.messageBus.handleCommand<string, ReadonlyArray<string>>(Messages.TranslateResult.GetTagSuggestions, handler);
    }
}