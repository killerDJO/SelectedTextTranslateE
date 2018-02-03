import { Menu, Tray } from "electron";
import * as path from "path";
import * as Rx from "rxjs/Rx";
import { Observer } from "rxjs/Observer";

export class Taskbar {
    private tray: Tray;

    public readonly OnShowTranslation: Rx.Observable<void>;
    public readonly OnShowSettings: Rx.Subject<void>;

    public constructor() {
        this.createTaskBar();

        this.OnShowTranslation = Rx.Observable.fromEventPattern((handler: () => void) => this.tray.on("click", handler));
        this.OnShowSettings = new Rx.Subject();
    }

    private createTaskBar(): void {
        this.tray = new Tray(path.resolve(__dirname, "icons\\tray.ico"));
        const contextMenu = Menu.buildFromTemplate([
            { label: "Settings", click: () => this.OnShowSettings.next(undefined) },
            { type: "separator" },
            { label: "Quite", type: "normal", role: "quit" }
        ]);
        this.tray.setToolTip("Selected Text Translate");
        this.tray.setContextMenu(contextMenu);
    }
}