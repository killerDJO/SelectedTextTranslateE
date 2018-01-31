import { ViewBase } from "./ViewBase";

export class TranslationView extends ViewBase {

    constructor() {
        super({
            width: 600,
            height: 600,
            frame: false,
            focusable: true,
            skipTaskbar: true,
            thickFrame: false,
            alwaysOnTop: true
        });

        this.window.on("blur", () => this.hide());
    }
}