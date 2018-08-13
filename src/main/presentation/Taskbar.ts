import { Menu, Tray } from "electron";
import { Subject, Observable, BehaviorSubject, fromEventPattern } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { injectable } from "inversify";

import { IconsProvider } from "presentation/infrastructure/IconsProvider";

@injectable()
export class Taskbar {
    private tray!: Tray;

    public readonly showSettings$: Subject<void> = new Subject();
    public readonly showHistory$: Subject<void> = new Subject();
    public readonly checkForUpdates$: Subject<void> = new Subject();
    public readonly isSuspended$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly translateSelectedText$: Subject<void> = new Subject();

    public constructor(
        private readonly iconsProvider: IconsProvider) {
        this.createTaskBar();

        fromEventPattern((handler: () => void) => this.tray.on("click", handler)).subscribe(() => this.translateSelectedText$.next());
        this.isSuspended$.pipe(distinctUntilChanged()).subscribe(() => this.updateTraySuspendedState());
    }

    private createTaskBar(): void {
        this.tray = new Tray(this.iconsProvider.getIconPath("tray"));
        this.tray.setToolTip("Selected text translate..");
        this.tray.setContextMenu(this.createContextMenu());
    }

    private updateTraySuspendedState(): void {
        this.tray.setImage(this.iconsProvider.getIconPath(this.isSuspended$.value ? "tray-suspended" : "tray"));
        this.tray.setContextMenu(this.createContextMenu());
    }

    private createContextMenu(): Electron.Menu {
        const suspendMenuItem: Electron.MenuItemConstructorOptions = this.isSuspended$.value
            ? { label: "Enable", click: () => this.isSuspended$.next(false) }
            : { label: "Suspend", click: () => this.isSuspended$.next(true) };

        return Menu.buildFromTemplate([
            { label: "Translate from clipboard", click: () => this.translateSelectedText$.next() },
            { label: "History", click: () => this.showHistory$.next() },
            { label: "Settings", click: () => this.showSettings$.next() },
            { type: "separator" },
            suspendMenuItem,
            { label: "Check for updates", click: () => this.checkForUpdates$.next() },
            { type: "separator" },
            { label: "Quit", type: "normal", role: "quit" }
        ])
    }
}