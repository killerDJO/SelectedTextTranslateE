import { globalShortcut } from "electron";
import { Subject } from "rxjs";
import { injectable } from "inversify";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { HotkeySettings } from "business-logic/settings/dto/HotkeySettings";
import { Hotkey } from "common/dto/settings/Hotkey";

@injectable()
export class HotkeysRegistry {

    private areHotkeysPaused: boolean = false;

    public readonly translate$: Subject<void> = new Subject();
    public readonly playText$: Subject<void> = new Subject();

    constructor(private readonly settingsProvider: SettingsProvider) {
        this.settingsProvider.getSettings().subscribe(() => this.remapHotkeys());
    }

    public registerHotkeys(): void {
        this.registerAllHotkeys();
    }

    public pauseHotkeys(): void {
        this.areHotkeysPaused = true;
        this.unregisterAllHotkeys();
    }

    public resumeHotkeys(): void {
        this.registerAllHotkeys();
        this.areHotkeysPaused = false;
    }

    private get hotkeys(): HotkeySettings {
        return this.settingsProvider.getSettings().value.hotkeys;
    }

    private remapHotkeys(): void {
        if (this.areHotkeysPaused) {
            return;
        }
        this.unregisterAllHotkeys();
        this.registerAllHotkeys();
    }

    private registerAllHotkeys(): void {
        this.registerCommand(this.hotkeys.translate, () => this.translate$.next());
        this.registerCommand(this.hotkeys.playText, () => this.playText$.next());
    }

    private unregisterAllHotkeys(): void {
        this.unregisterCommand(this.hotkeys.translate);
        this.unregisterCommand(this.hotkeys.playText);
    }

    private registerCommand(hotkeys: Hotkey[], action: () => void): void {
        hotkeys.forEach(hotkey => globalShortcut.register(this.createAccelerator(hotkey), action));
    }

    private unregisterCommand(hotkeys: Hotkey[]): void {
        hotkeys.forEach(hotkey => globalShortcut.unregister(this.createAccelerator(hotkey)));
    }

    private createAccelerator(hotkey: Hotkey): Electron.Accelerator {
        return hotkey.keys.join("+");
    }
}