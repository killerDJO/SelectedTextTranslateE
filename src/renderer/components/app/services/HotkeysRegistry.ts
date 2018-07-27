import { remote } from "electron";

import { Hotkey } from "common/dto/settings/Hotkey";
import * as Mousetrap from "mousetrap";

export class HotkeysRegistry {
    public registerHotkeys(hotkeys: Hotkey[], callback: () => void): void {
        Mousetrap.bind(hotkeys.map(this.createCommand.bind(this)), callback);
    }

    public unregisterAllHotkeys(): void {
        Mousetrap.reset();
    }

    public registerDevToolsHotkey(): void {
        Mousetrap.bind("ctrl+shift+i", () => remote.getCurrentWindow().webContents.toggleDevTools());
    }

    private createCommand(hotkey: Hotkey): string {
        return hotkey.keys.map(this.remapKey.bind(this)).join("+");
    }

    private remapKey(key: string): string {
        const lowerCaseKey = key.toLowerCase();
        const keysMap: { [key: string]: string } = {
            "control": "ctrl"
        };
        return keysMap[lowerCaseKey] || lowerCaseKey;
    }
}