import { screen } from "electron";
import { BehaviorSubject } from "rxjs";

import { Messages } from "common/messaging/Messages";
import { ViewNames } from "common/ViewNames";

import { ViewContext } from "presentation/framework/ViewContext";
import { TranslateResultView } from "presentation/views/TranslateResultView";

export class TranslationView extends TranslateResultView {

    private currentScaleFactor: number | null = null;

    constructor(viewContext: ViewContext) {
        super(ViewNames.Translation, viewContext, {
            isFrameless: true,
            isScalingEnabled: new BehaviorSubject(true)
        });

        this.window.setAlwaysOnTop(true);
        this.window.setSkipTaskbar(true);

        this.window.on("blur", () => this.hide());
    }

    public showTextInput(): void {
        this.messageBus.sendNotification(Messages.Translation.ShowInputCommand);
        this.show();
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