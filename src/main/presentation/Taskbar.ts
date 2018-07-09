import { Menu, Tray, shell } from "electron";

import { Subject, Observable } from "rxjs";
import { injectable } from "inversify";

import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";

@injectable()
export class Taskbar {
    private tray!: Tray;

    public readonly showTranslation$: Observable<void>;
    public readonly showSettings$: Subject<void>;
    public readonly translateSelectedText$: Subject<void>;

    public constructor(
        private readonly storageFolderProvider: StorageFolderProvider,
        private readonly iconsProvider: IconsProvider) {
        this.createTaskBar();

        this.showTranslation$ = Observable.fromEventPattern((handler: () => void) => this.tray.on("click", handler));
        this.showSettings$ = new Subject();
        this.translateSelectedText$ = new Subject();
    }

    private createTaskBar(): void {
        this.tray = new Tray(this.iconsProvider.getIconPath("tray"));
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