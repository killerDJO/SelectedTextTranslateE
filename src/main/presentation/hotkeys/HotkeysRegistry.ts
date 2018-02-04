import { globalShortcut } from "electron";
import * as Rx from "rxjs/Rx";

export class HotkeysRegistry {

    public readonly OnTranslate: Rx.Subject<void>;

    constructor() {
        this.OnTranslate = new Rx.Subject();
    }

    public registerHotkeys(): void {
        globalShortcut.register("CommandOrControl+T", () => {
            this.OnTranslate.next();
        });
    }
}