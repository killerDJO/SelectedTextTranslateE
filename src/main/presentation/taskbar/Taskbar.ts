import { Menu, Tray } from "electron";
import * as path from "path";
import * as Rx from "rxjs/Rx";
import { Observer } from "rxjs/Observer";

export class Taskbar {
    private tray!: Tray;

    public readonly OnShowTranslation: Rx.Observable<void>;
    public readonly OnShowSettings: Rx.Subject<void>;
    public readonly OnTranslateSelectedText: Rx.Subject<void>;

    public constructor() {
        this.createTaskBar();

        this.OnShowTranslation = Rx.Observable.fromEventPattern((handler: () => void) => this.tray.on("click", handler));
        this.OnShowSettings = new Rx.Subject();
        this.OnTranslateSelectedText = new Rx.Subject();
    }

    private createTaskBar(): void {
        this.tray = new Tray(path.resolve(__dirname, "icons\\tray.ico"));
        const contextMenu = Menu.buildFromTemplate([
            { label: "Translate from clipboard", click: () => this.OnTranslateSelectedText.next() },
            { label: "Dictionary" },
            { label: "Settings", click: () => this.OnShowSettings.next() },
            { type: "separator" },
            { label: "Suspend" },
            { type: "separator" },
            { label: "Quit", type: "normal", role: "quit" }
        ]);
        this.tray.setToolTip("Selected text translate..");
        this.tray.setContextMenu(contextMenu);
    }
}