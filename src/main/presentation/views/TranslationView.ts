import { BrowserWindow, screen } from "electron";
import { Observable, Subject } from "rxjs";
import { injectable, inject } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { PresentationSettings } from "main/presentation/settings/PresentationSettings";
import { HotkeysRegistry } from "main/presentation/hotkeys/HotkeysRegistry";
import { ViewBase } from "main/presentation/views/ViewBase";

@injectable()
export class TranslationView extends ViewBase {

    public readonly playText$: Observable<string>;

    constructor(
        private readonly hotkeysRegistry: HotkeysRegistry,
        presentationSettings: PresentationSettings) {
        super(presentationSettings);

        const bounds = this.computeBounds();
        this.initialize(new BrowserWindow({
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            frame: false,
            focusable: true,
            skipTaskbar: true,
            thickFrame: false,
            alwaysOnTop: true,
            show: false
        }));

        this.presentationSettings.scaleFactor$.subscribe(this.scale.bind(this));
        this.messageBus.registerObservable(Messages.AccentColor, this.presentationSettings.accentColor$);
        this.messageBus.registerObservable(Messages.ResultVisibilitySettings, this.presentationSettings.resultVisibilitySettings$);
        this.messageBus.registerObservable(Messages.ScoreSettings, this.presentationSettings.scoreSettings$);

        this.window.on("focus", () => {
            this.hotkeysRegistry.registerZoomHotkeys();
        });
        this.window.on("blur", () => {
            this.hotkeysRegistry.unregisterZoomHotkeys();
        });

        this.window.on("blur", () => this.hide());

        this.playText$ = this.messageBus.getValue(Messages.PlayTextCommand);
    }

    public showTranslateResult(translateResult: TranslateResult | null): void {
        this.messageBus.sendValue(Messages.TranslateResult, translateResult);
    }

    private scale(scaleFactor: number): void {
        this.window.setBounds(this.computeBounds());
        this.messageBus.sendValue(Messages.ScaleFactor, scaleFactor);
    }

    private computeBounds(): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();
        const padding = 5;
        const width = this.presentationSettings.scale(300);
        const height = this.presentationSettings.scale(400);
        return {
            width: width,
            height: height,
            x: primaryDisplay.workArea.width - width - padding,
            y: primaryDisplay.workArea.height - height - padding
        };
    }
}