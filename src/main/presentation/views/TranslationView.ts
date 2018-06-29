import { BrowserWindow, screen } from "electron";
import { Observable, Subject } from "rxjs";
import { injectable, inject } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";

@injectable()
export class TranslationView extends ViewBase {

    public playText$!: Observable<string>;
    public translateText$!: Observable<string>;
    public forceTranslateText$!: Observable<string>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.TranslationResult, viewContext);

        this.window.setAlwaysOnTop(true);
        this.window.setSkipTaskbar(true);

        const settings = this.context.settingsProvider.getSettings();
        this.messageBus.registerValue(Messages.ResultVisibilitySettings, settings.presentation.visibility);
        this.messageBus.registerValue(Messages.ScoreSettings, settings.presentation.score);

        this.playText$ = this.messageBus.getValue(Messages.PlayTextCommand);
        this.translateText$ = this.messageBus.getValue(Messages.TranslateCommand);
        this.forceTranslateText$ = this.messageBus.getValue(Messages.ForceTranslateCommand);

        //this.window.on("blur", () => this.hide());
    }

    public showTranslateResult(translateResult: TranslateResult | null): void {
        this.messageBus.sendValue(Messages.TranslateResult, translateResult);
    }

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        return this.getInitialBounds();
    }

    protected getInitialBounds(): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();
        const padding = 5;
        const width = this.context.scaler.scale(300);
        const height = this.context.scaler.scale(400);
        return {
            width: width,
            height: height,
            x: primaryDisplay.workArea.width - width - padding,
            y: primaryDisplay.workArea.height - height - padding
        };
    }
}