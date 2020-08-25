import * as Mousetrap from "mousetrap";
import * as _ from "lodash";

import { Hotkey } from "common/dto/settings/Hotkey";

class HotkeysRegistry {
    private readonly hotkeysByNamespace: Map<string, ReadonlyArray<Hotkey>> = new Map();

    public registerHotkeys(namespace: string, hotkeys: ReadonlyArray<Hotkey>, callback: () => void): void {
        Mousetrap.bind(this.mapHotkeysToStrings(hotkeys), () => {
            callback();
            return false;
        });

        const currentNamespaceHotkeys = (this.hotkeysByNamespace.get(namespace) || []).concat(hotkeys);
        this.hotkeysByNamespace.set(namespace, currentNamespaceHotkeys);
    }

    public unregisterHotkeys(namespace: string): void {
        const hotkeys = this.hotkeysByNamespace.get(namespace) || [];
        Mousetrap.unbind(this.mapHotkeysToStrings(hotkeys));
        this.hotkeysByNamespace.set(namespace, []);
    }

    private mapHotkeysToStrings(hotkeys: ReadonlyArray<Hotkey>): string[] {
        return hotkeys.map(this.createCommand.bind(this));
    }

    private createCommand(hotkey: Hotkey): string {
        return hotkey.keys.map(this.remapKey.bind(this)).join("+");
    }

    private remapKey(key: string): string {
        const lowerCaseKey = key.toLowerCase();
        const keysMap: { [key: string]: string } = {
            // tslint:disable: object-literal-key-quotes
            "control": "ctrl",
            "delete": "del"
            // tslint:enable: object-literal-key-quotes
        };
        return keysMap[lowerCaseKey] || lowerCaseKey;
    }
}

const hotkeysRegistry: HotkeysRegistry = new HotkeysRegistry();
export { hotkeysRegistry };