import { screen } from "electron";
import { Observable, BehaviorSubject } from "rxjs";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { ViewBase } from "presentation/framework/ViewBase";
import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";

export class TranslationView extends ViewBase {

    private currentScaleFactor: number | null = null;

    public readonly playText$!: Observable<string>;
    public readonly translateText$!: Observable<string>;
    public readonly forceTranslateText$!: Observable<string>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.TranslationResult, viewContext, {
            isFrameless: true,
            isScalingEnabled: new BehaviorSubject(true)
        });

        this.window.setAlwaysOnTop(true);
        this.window.setSkipTaskbar(true);

        this.messageBus.sendValue(Messages.Translation.TranslationResultViewSettings, this.context.viewsSettings.translation.renderer);
        this.playText$ = this.messageBus.getValue(Messages.Translation.PlayTextCommand);
        this.translateText$ = this.messageBus.getValue(Messages.Translation.TranslateCommand);
        this.forceTranslateText$ = this.messageBus.getValue(Messages.Translation.ForceTranslateCommand);

        this.window.on("blur", () => this.hide());
    }

    public setTranslateResult(translateResult: TranslateResult | null): void {
        this.messageBus.sendValue(Messages.Translation.TranslateResult, translateResult);
    }

    protected scaleBounds(bounds: Electron.Rectangle): Electron.Rectangle {
        const bottomRightX = bounds.x + bounds.width;
        const bottomRightY = bounds.y + bounds.height;
        const previousScaleFactor = this.currentScaleFactor || this.scaler.scaleFactor$.value;
        const width = this.scaler.rescaleValue(bounds.width, previousScaleFactor);
        const height = this.scaler.rescaleValue(bounds.height, previousScaleFactor);

        this.setCurrentScaleFactor();

        return {
            width: width,
            height: height,
            x: bottomRightX - width,
            y: bottomRightY - height
        };
    }

    protected getInitialBounds(): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();

        const translationSettings = this.context.viewsSettings.translation;
        const width = this.scaler.scaleValue(translationSettings.width);
        const height = this.scaler.scaleValue(translationSettings.height);

        this.setCurrentScaleFactor();

        return {
            width: width,
            height: height,
            x: primaryDisplay.workArea.width - width - translationSettings.margin,
            y: primaryDisplay.workArea.height - height - translationSettings.margin
        };
    }

    private setCurrentScaleFactor(): void {
        this.currentScaleFactor = this.scaler.scaleFactor$.value;
    }
}