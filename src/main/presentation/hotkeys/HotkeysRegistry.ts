import { globalShortcut } from "electron";
import { Subject } from "rxjs";

export class HotkeysRegistry {

    public readonly OnTranslate: Subject<void>;

    constructor() {
        this.OnTranslate = new Subject();
    }

    public registerHotkeys(): void {
        globalShortcut.register("CommandOrControl+T", () => {
            this.OnTranslate.next();
        });
    }
}