import { Menu, Tray, app, dialog } from "electron";
import { Subject, BehaviorSubject, fromEventPattern } from "rxjs";
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

    public watchPlayingState(isPlaying$: BehaviorSubject<boolean>) {
        isPlaying$.pipe(distinctUntilChanged()).subscribe(isPlaying => {
            if (isPlaying) {
                this.tray.setImage(this.iconsProvider.getIconPath("tray-playing"));
            } else {
                this.tray.setImage(this.getCurrentIcon());
            }
        });
    }

    public suspend(): void {
        this.isSuspended$.next(true);
    }

    public resume(): void {
        this.isSuspended$.next(false);
    }

    private createTaskBar(): void {
        this.tray = new Tray(this.iconsProvider.getIconPath("tray"));
        this.tray.setToolTip("Selected text translate..");
        this.tray.setContextMenu(this.createContextMenu());
    }

    private updateTraySuspendedState(): void {
        this.tray.setImage(this.getCurrentIcon());
        this.tray.setContextMenu(this.createContextMenu());
    }

    private getCurrentIcon(): string {
        return this.iconsProvider.getIconPath(this.isSuspended$.value ? "tray-suspended" : "tray")
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
            { label: "About", click: () => this.showAbout() },
            { label: "Quit", type: "normal", role: "quit" }
        ]);
    }

    private showAbout(): void {
        const dialogOpts = {
            type: "info",
            title: "About",
            message: `Current version is ${app.getVersion()}.`,
        };
        dialog.showMessageBox(dialogOpts);
    }
}