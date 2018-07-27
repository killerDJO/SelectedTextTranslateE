import { globalShortcut } from "electron";
import { Subject } from "rxjs";
import { injectable } from "inversify";

import { SettingsProvider } from "business-logic/settings/SettingsProvider";;
import { Hotkey } from "common/dto/settings/Hotkey";
import { HotkeySettings } from "business-logic/settings/dto/Settings";

@injectable()
export class HotkeysRegistry {

    private areHotkeysPaused: boolean = false;
    private currentHotkeys: HotkeySettings;

    public readonly translate$: Subject<void> = new Subject();
    public readonly playText$: Subject<void> = new Subject();

    constructor(private readonly settingsProvider: SettingsProvider) {
        this.currentHotkeys = this.getHotkeys();
        this.settingsProvider.getSettings().subscribe(() => this.remapHotkeys());
    }

    public registerHotkeys(): void {
        this.registerAllHotkeys(this.currentHotkeys);
    }

    public pauseHotkeys(): void {
        this.areHotkeysPaused = true;
        this.unregisterAllHotkeys(this.currentHotkeys);
    }

    public resumeHotkeys(): void {
        this.registerAllHotkeys(this.currentHotkeys);
        this.areHotkeysPaused = false;
    }

    private getHotkeys(): HotkeySettings {
        return this.settingsProvider.getSettings().value.hotkeys;
    }

    private remapHotkeys(): void {
        if (this.areHotkeysPaused) {
            this.currentHotkeys = this.getHotkeys();
            return;
        }

        this.unregisterAllHotkeys(this.currentHotkeys);
        this.registerAllHotkeys(this.getHotkeys());
        this.currentHotkeys = this.getHotkeys();
    }

    private registerAllHotkeys(hotkeys: HotkeySettings): void {
        this.registerCommand(hotkeys.translate, () => this.translate$.next());
        this.registerCommand(hotkeys.playText, () => this.playText$.next());
    }

    private unregisterAllHotkeys(hotkeys: HotkeySettings): void {
        this.unregisterCommand(hotkeys.translate);
        this.unregisterCommand(hotkeys.playText);
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