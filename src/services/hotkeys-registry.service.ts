import { KeyBindingMap, tinykeys } from 'tinykeys';

import { Keys } from '~/host/models/settings.model';

class HotkeysRegistry {
  private readonly hotkeysUnregisterByNamespace: Map<string, ReadonlyArray<() => void>> = new Map();

  public registerHotkeys(
    namespace: string,
    hotkeys: ReadonlyArray<Keys>,
    callback: () => void
  ): void {
    const bindingsMap: KeyBindingMap = this.mapHotkeysToStrings(hotkeys).reduce((map, hotkey) => {
      map[hotkey] = event => {
        event.preventDefault();
        callback();
      };
      return map;
    }, {} as KeyBindingMap);
    const unregister = tinykeys(window, bindingsMap);

    const currentNamespaceHotkeys = (this.hotkeysUnregisterByNamespace.get(namespace) ?? []).concat(
      unregister
    );
    this.hotkeysUnregisterByNamespace.set(namespace, currentNamespaceHotkeys);
  }

  public unregisterHotkeys(namespace: string): void {
    const hotkeys = this.hotkeysUnregisterByNamespace.get(namespace) || [];
    hotkeys.forEach(unregister => unregister());
    this.hotkeysUnregisterByNamespace.set(namespace, []);
  }

  private mapHotkeysToStrings(hotkeys: ReadonlyArray<Keys>): string[] {
    return hotkeys.map(hotkeys => hotkeys.join('+'));
  }
}
export const hotkeysRegistry = new HotkeysRegistry();
