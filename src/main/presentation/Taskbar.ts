import { Menu, Tray, app, dialog, nativeImage, NativeImage, MenuItemConstructorOptions, BrowserWindow } from "electron";
import { Subject, BehaviorSubject, fromEventPattern } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { injectable } from "inversify";

import { Tag } from "common/dto/history/Tag";

import { TagsEngine } from "business-logic/history/TagsEngine";

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
        private readonly iconsProvider: IconsProvider,
        private readonly tagsEngine: TagsEngine) {
        this.createTaskBar();

        fromEventPattern((handler: () => void) => this.tray.on("click", handler)).subscribe(() => this.translateSelectedText$.next());
        this.isSuspended$.pipe(distinctUntilChanged()).subscribe(() => this.updateTrayState());
        this.tagsEngine.getCurrentTags().subscribe(() => this.updateTrayState());
    }

    public watchPlayingState(isPlaying$: BehaviorSubject<boolean>) {
        isPlaying$.pipe(distinctUntilChanged()).subscribe(isPlaying => {
            if (isPlaying) {
                this.tray.setImage(this.getIcon("tray-playing"));
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
        this.tray = new Tray(this.getIcon("tray"));
        this.tray.setToolTip("Selected text translate..");
        this.tray.setContextMenu(this.createContextMenu());
    }

    private getIcon(iconType: string): NativeImage {
        return nativeImage.createFromPath(this.iconsProvider.getIconPath(iconType));
    }

    private updateTrayState(): void {
        this.tray.setImage(this.getCurrentIcon());
        this.tray.setContextMenu(this.createContextMenu());
    }

    private getCurrentIcon(): NativeImage {
        return this.getIcon(this.isSuspended$.value ? "tray-suspended" : "tray");
    }

    private createContextMenu(): Electron.Menu {
        const suspendMenuItem: Electron.MenuItemConstructorOptions = this.isSuspended$.value
            ? { label: "Enable", click: () => this.isSuspended$.next(false) }
            : { label: "Suspend", click: () => this.isSuspended$.next(true) };

        const tagsList = this.tagsEngine.getCurrentTags().value.map(tag => {
            const options: MenuItemConstructorOptions = {
                label: tag.tag,
                type: "checkbox",
                checked: tag.isEnabled,
                click: () => this.toggleTag(tag)
            };
            return options;
        });

        return Menu.buildFromTemplate([
            { label: "Translate from clipboard", click: () => this.translateSelectedText$.next() },
            { label: "History", click: () => this.showHistory$.next() },
            { label: "Settings", click: () => this.showSettings$.next() },
            { type: "separator" },
            { label: "Tags", submenu: tagsList },
            suspendMenuItem,
            { type: "separator" },
            { label: "Check for updates", click: () => this.checkForUpdates$.next() },
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

    private toggleTag(tag: Tag): void {
        const filteredTags = this.tagsEngine.getCurrentTags().value.filter(currentTag => currentTag.tag !== tag.tag);
        this.tagsEngine.updateCurrentTags(filteredTags.concat([{
            tag: tag.tag,
            isEnabled: !tag.isEnabled
        }]));
    }
}