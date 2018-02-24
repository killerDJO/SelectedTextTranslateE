import { BrowserWindow, screen } from "electron";
import { Observable } from "rxjs";
import { injectable, inject } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { ScaleProvider } from "../framework/ScaleProvider";
import { ViewBase } from "./ViewBase";
import { HotkeysRegistry } from "../hotkeys/HotkeysRegistry";

@injectable()
export class TranslationView extends ViewBase {
    constructor(
        private readonly hotkeysRegistry: HotkeysRegistry,
        scaleProvider: ScaleProvider) {
        super(scaleProvider);

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

        this.messageBus.registerObservable(Messages.ScaleFactor, this.scaleProvider.scaleFactor$);
        this.scaleProvider.scaleFactor$.subscribe(this.scale.bind(this));

        this.window.on("focus", () => {
            this.hotkeysRegistry.registerZoomHotkeys();
        });
        this.window.on("blur", () => {
            this.hotkeysRegistry.unregisterZoomHotkeys();
        });

        // this.window.on("blur", () => this.hide());
    }

    public showTranslateResult(translateResult: TranslateResult | null): void {
        this.messageBus.sendValue(Messages.TranslateResult, translateResult);
    }

    private scale(): void {
        this.window.setBounds(this.computeBounds());
    }

    private computeBounds(): Electron.Rectangle {
        const primaryDisplay = screen.getPrimaryDisplay();
        const padding = 5;
        const width = this.scaleProvider.scale(300);
        const height = this.scaleProvider.scale(400);
        return {
            width: width,
            height: height,
            x: primaryDisplay.workArea.width - width - padding,
            y: primaryDisplay.workArea.height - height - padding
        };
    }
}