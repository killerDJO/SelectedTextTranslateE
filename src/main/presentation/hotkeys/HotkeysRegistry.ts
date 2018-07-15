import { globalShortcut } from "electron";
import { Subject } from "rxjs";
import { injectable } from "inversify";

import { IZoomHotkeysRegistry } from "presentation/hotkeys/IZoomHotkeysRegistry";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HotkeySettings } from "business-logic/settings/dto/HotkeySettings";

@injectable()
export class HotkeysRegistry implements IZoomHotkeysRegistry {

    public readonly translate$: Subject<void> = new Subject();
    public readonly playText$: Subject<void> = new Subject();
    public readonly zoomIn$: Subject<void> = new Subject();
    public readonly zoomOut$: Subject<void> = new Subject();

    constructor(private readonly settingsProvider: SettingsProvider) {
    }

    public registerHotkeys(): void {
        this.registerCommands(this.hotkeys.translate, () => {
            this.translate$.next();
        });
        this.registerCommands(this.hotkeys.playText, () => this.playText$.next());
    }

    public registerZoomHotkeys(): void {
        this.registerCommands(this.hotkeys.zoomIn, () => this.zoomIn$.next());
        this.registerCommands(this.hotkeys.zoomOut, () => this.zoomOut$.next());
    }

    public unregisterZoomHotkeys(): void {
        this.unregisterCommands(this.hotkeys.zoomIn);
        this.unregisterCommands(this.hotkeys.zoomOut);
    }

    private get hotkeys(): HotkeySettings {
        return this.settingsProvider.getSettings().hotkeys;
    }

    private registerCommands(commands: string[], action: () => void): void {
        commands.forEach(command => globalShortcut.register(command, action));
    }

    private unregisterCommands(commands: string[]): void {
        commands.forEach(command => globalShortcut.unregister(command));
    }
}