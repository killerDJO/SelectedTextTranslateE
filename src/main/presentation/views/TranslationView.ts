import { screen } from "electron";
import { Observable } from "rxjs";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";

export class TranslationView extends ViewBase {

    public playText$!: Observable<string>;
    public translateText$!: Observable<string>;
    public forceTranslateText$!: Observable<string>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.TranslationResult, viewContext, { isFrameless: true });

        this.window.setAlwaysOnTop(true);
        this.window.setSkipTaskbar(true);

        const settings = this.context.settingsProvider.getSettings();
        this.messageBus.registerValue(Messages.PresentationSettings, settings.presentation);

        this.playText$ = this.messageBus.getValue(Messages.PlayTextCommand);
        this.translateText$ = this.messageBus.getValue(Messages.TranslateCommand);
        this.forceTranslateText$ = this.messageBus.getValue(Messages.ForceTranslateCommand);

        this.window.on("blur", () => this.hide());
    }

    public setTranslateResult(translateResult: TranslateResult | null): void {
        this.messageBus.sendValue(Messages.TranslateResult, translateResult);
    }

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        const bottomRightX = bounds.x + bounds.width;
        const bottomRightY = bounds.y + bounds.height;
        const width = this.context.scaler.rescale(bounds.width);
        const height = this.context.scaler.rescale(bounds.height);
        return {
            width: width,
            height: height,
            x: bottomRightX - width,
            y: bottomRightY - height
        };
    }

    protected getInitialBounds(): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();

        const translationSettings = this.context.settingsProvider.getSettings().view.translation;
        const width = this.context.scaler.scale(translationSettings.width);
        const height = this.context.scaler.scale(translationSettings.height);
        return {
            width: width,
            height: height,
            x: primaryDisplay.workArea.width - width - translationSettings.margin,
            y: primaryDisplay.workArea.height - height - translationSettings.margin
        };
    }
}