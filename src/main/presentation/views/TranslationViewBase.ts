import { Observable, Subject } from "rxjs";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";

import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslateResultCommand } from "common/dto/translation/TranslateResultCommand";
import { ViewOptions } from "presentation/framework/ViewOptions";

export abstract class TranslationViewBase extends ViewBase {
    protected inProgressTimeout: NodeJS.Timer | null = null;

    public readonly playText$!: Observable<string>;
    public readonly translateText$!: Observable<string>;
    public readonly forceTranslateText$!: Observable<string>;

    constructor(viewName: ViewNames, context: ViewContext, viewOptions: ViewOptions) {
        super(viewName, context, viewOptions);

        this.messageBus.sendValue(Messages.Translation.TranslationResultViewSettings, this.context.viewsSettings.translation.renderer);
        this.playText$ = this.messageBus.getValue(Messages.Translation.PlayTextCommand);
        this.translateText$ = this.messageBus.getValue(Messages.Translation.TranslateCommand);
        this.forceTranslateText$ = this.messageBus.getValue(Messages.Translation.ForceTranslateCommand);
    }

    public showProgressIndicator(): void {
        this.messageBus.sendNotification(Messages.Translation.InProgressCommand);
        this.show();
    }

    public setTranslateResult(translateResult: TranslateResult | null, defaultTranslateResultView: TranslateResultViews): Subject<void> {
        return this.messageBus.sendValue<TranslateResultCommand>(Messages.Translation.TranslateResult, { translateResult, defaultView: defaultTranslateResultView });
    }
}