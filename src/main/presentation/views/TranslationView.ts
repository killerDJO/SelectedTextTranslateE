import { ViewBase } from "./ViewBase";
import { ScaleProvider } from "../providers/ScaleProvider";
import { BrowserWindow, screen } from "electron";

export class TranslationView extends ViewBase {
    private readonly scaleProvider: ScaleProvider = new ScaleProvider();

    constructor() {
        super();
        const primaryDisplay = screen.getPrimaryDisplay();

        const width = this.scaleProvider.scale(300);
        const height = this.scaleProvider.scale(400);
        const padding = 5;
        const x = primaryDisplay.workArea.width - width - padding;
        const y = primaryDisplay.workArea.height - height - padding;

        this.window = new BrowserWindow({
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
        });

        this.window.on("blur", () => this.hide());

        this.load();
    }

    public showTranslateResult(translateResult: string): void {
        this.messageBus.sendTranslateResult(this.window, translateResult);
    }
}