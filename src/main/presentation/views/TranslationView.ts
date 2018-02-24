import { BrowserWindow, screen } from "electron";
import { Observable } from "rxjs";
import { injectable, inject } from "inversify";

import { TranslateResult } from "common/dto/translation/TranslateResult";
import { Messages } from "common/messaging/Messages";

import { ScaleProvider } from "../framework/ScaleProvider";
import { ViewBase } from "./ViewBase";

@injectable()
export class TranslationView extends ViewBase {
    constructor(scaleProvider: ScaleProvider) {
        super(scaleProvider);

        const primaryDisplay = screen.getPrimaryDisplay();

        const width = this.scaleProvider.scale(300);
        const height = this.scaleProvider.scale(400);
        const padding = 5;
        const x = primaryDisplay.workArea.width - width - padding;
        const y = primaryDisplay.workArea.height - height - padding;

        this.initialize(new BrowserWindow({
            width: width,
            height: height,
            x: x,
            y: y,
            frame: false,
            focusable: true,
            skipTaskbar: true,
            thickFrame: false,
            alwaysOnTop: true,
            show: false
        }));

        // this.window.on("blur", () => this.hide());
    }

    public showTranslateResult(translateResult: TranslateResult | null): void {
        this.messageBus.sendValue(Messages.TranslateResult, translateResult);
    }
}