import { Menu, Tray } from "electron";
import { Subject, Observable, BehaviorSubject, fromEventPattern } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { injectable } from "inversify";

import { IconsProvider } from "presentation/infrastructure/IconsProvider";

@injectable()
export class Taskbar {
    private tray!: Tray;

    public readonly showTranslation$: Observable<void>;
    public readonly showSettings$: Subject<void>;
    public readonly showHistory$: Subject<void>;
    public readonly isSuspended$: BehaviorSubject<boolean>;
    public readonly translateSelectedText$: Subject<void>;

    public constructor(
        private readonly iconsProvider: IconsProvider) {
        this.showTranslation$ = fromEventPattern((handler: () => void) => this.tray.on("click", handler));
        this.showSettings$ = new Subject();
        this.showHistory$ = new Subject();
        this.isSuspended$ = new BehaviorSubject(false);
        this.translateSelectedText$ = new Subject();

        this.createTaskBar();
        this.isSuspended$.pipe(distinctUntilChanged()).subscribe(() => this.updateTraySuspendedState());
    }

    private createTaskBar(): void {
        this.tray = new Tray(this.iconsProvider.getIconPath("tray"));
        this.tray.setToolTip("Selected text translate [Updated]..");
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
            { type: "separator" },
            { label: "Quit", type: "normal", role: "quit" }
        ])
    }
}