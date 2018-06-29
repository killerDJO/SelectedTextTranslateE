import { globalShortcut } from "electron";
import { Subject } from "rxjs";
import { injectable } from "inversify";

import { IZoomHotkeysRegistry } from "presentation/hotkeys/IZoomHotkeysRegistry";

@injectable()
export class HotkeysRegistry implements IZoomHotkeysRegistry {

    public readonly translate$: Subject<void>;
    public readonly zoomIn$: Subject<void>;
    public readonly zoomOut$: Subject<void>;

    constructor() {
        this.translate$ = new Subject();
        this.zoomIn$ = new Subject();
        this.zoomOut$ = new Subject();
    }

    public registerHotkeys(): void {
        globalShortcut.register("CommandOrControl+T", () => {
            this.translate$.next();
        });
    }

    public registerZoomHotkeys(): void {
        globalShortcut.register("CommandOrControl+=", () => {
            this.zoomIn$.next();
        });
        globalShortcut.register("CommandOrControl+-", () => {
            this.zoomOut$.next();
        });
    }

    public unregisterZoomHotkeys(): void {
        globalShortcut.unregister("CommandOrControl+=");
        globalShortcut.unregister("CommandOrControl+-");
    }
}