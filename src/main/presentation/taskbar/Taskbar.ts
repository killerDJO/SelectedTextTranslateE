import { Menu, Tray } from "electron";
import * as path from "path";
import { Subject, Observable } from "rxjs";

export class Taskbar {
    private tray!: Tray;

    public readonly OnShowTranslation: Observable<void>;
    public readonly OnShowSettings: Subject<void>;
    public readonly OnTranslateSelectedText: Subject<void>;

    public constructor() {
        this.createTaskBar();

        this.OnShowTranslation = Observable.fromEventPattern((handler: () => void) => this.tray.on("click", handler));
        this.OnShowSettings = new Subject();
        this.OnTranslateSelectedText = new Subject();
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