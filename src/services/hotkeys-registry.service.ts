import * as Mousetrap from 'mousetrap';

import { Keys } from '~/host/models/settings.model';

class HotkeysRegistry {
  private readonly hotkeysByNamespace: Map<string, ReadonlyArray<Keys>> = new Map();

  public registerHotkeys(
    namespace: string,
    hotkeys: ReadonlyArray<Keys>,
    callback: () => void
  ): void {
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

  private mapHotkeysToStrings(hotkeys: ReadonlyArray<Keys>): string[] {
    return hotkeys.map(this.createCommand.bind(this));
  }

  private createCommand(hotkey: Keys): string {
    return hotkey.map(this.remapKey.bind(this)).join('+');
  }

  private remapKey(key: string): string {
    const lowerCaseKey = key.toLowerCase();
    const keysMap: { [key: string]: string } = {
      control: 'ctrl',
      delete: 'del'
    };
    return keysMap[lowerCaseKey] || lowerCaseKey;
  }
}

export const hotkeysRegistry = new HotkeysRegistry();
