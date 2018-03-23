import { BrowserWindow, screen } from "electron";
import { Observable, Subject } from "rxjs";
import { injectable, inject } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { PresentationSettings } from "presentation/settings/PresentationSettings";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { Scaler } from "presentation/infrastructure/Scaler";
import { ViewBase } from "presentation/views/ViewBase";
import { ViewNames } from "common/ViewNames";

@injectable()
export class TranslationView extends ViewBase {

    public playText$!: Observable<string>;
    public translateText$!: Observable<string>;
    public forceTranslateText$!: Observable<string>;

    constructor(
        presentationSettings: PresentationSettings,
        scaler: Scaler,
        hotkeysRegistry: HotkeysRegistry) {
        super(ViewNames.TranslationResult, presentationSettings, scaler, hotkeysRegistry);

        this.window.setAlwaysOnTop(true);
        this.window.setSkipTaskbar(true);

        this.messageBus.registerObservable(Messages.ResultVisibilitySettings, this.presentationSettings.resultVisibilitySettings$);
        this.messageBus.registerObservable(Messages.ScoreSettings, this.presentationSettings.scoreSettings$);

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
        const width = this.scaler.scale(300);
        const height = this.scaler.scale(400);
        return {
            width: width,
            height: height,
            x: primaryDisplay.workArea.width - width - padding,
            y: primaryDisplay.workArea.height - height - padding
        };
    }
}