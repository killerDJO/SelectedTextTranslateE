import { Menu, Tray, shell } from "electron";
import * as path from "path";
import { Subject, Observable } from "rxjs";
import { injectable } from "inversify";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";

@injectable()
export class Taskbar {
    private tray!: Tray;

    public readonly showTranslation$: Observable<void>;
    public readonly showSettings$: Subject<void>;
    public readonly translateSelectedText$: Subject<void>;

    public constructor(private readonly storageFolderProvider: StorageFolderProvider) {
        this.createTaskBar();

        this.showTranslation$ = Observable.fromEventPattern((handler: () => void) => this.tray.on("click", handler));
        this.showSettings$ = new Subject();
        this.translateSelectedText$ = new Subject();
    }

    private createTaskBar(): void {
        this.tray = new Tray(path.resolve(__dirname, "icons\\tray.ico"));
        const contextMenu = Menu.buildFromTemplate([
            { label: "Translate from clipboard", click: () => this.translateSelectedText$.next() },
            { label: "Dictionary" },
            { label: "Settings", click: () => this.showSettings$.next() },
            { type: "separator" },
            { label: "Suspend" },
            { label: "Open storage folder", click: () => shell.openItem(this.storageFolderProvider.getPath()) },
            { type: "separator" },
            { label: "Quit", type: "normal", role: "quit" }
        ]);
        this.tray.setToolTip("Selected text translate..");
        this.tray.setContextMenu(contextMenu);
    }
}