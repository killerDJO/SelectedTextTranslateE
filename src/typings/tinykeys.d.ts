// Forked declarations until issue with original package is resolved:
// https://github.com/jamiebuilds/tinykeys/issues/191
declare module 'tinykeys' {
  declare type KeyBindingPress = [string[], string];

  export interface KeyBindingMap {
    [keybinding: string]: (event: KeyboardEvent) => void;
  }

  export interface KeyBindingHandlerOptions {
    timeout?: number;
  }

  export interface KeyBindingOptions extends KeyBindingHandlerOptions {
    event?: 'keydown' | 'keyup';
  }

  export declare function parseKeybinding(str: string): KeyBindingPress[];

  export declare function createKeybindingsHandler(
    keyBindingMap: KeyBindingMap,
    options?: KeyBindingHandlerOptions
  ): EventListener;

  export declare function tinykeys(
    target: Window | HTMLElement,
    keyBindingMap: KeyBindingMap,
    options?: KeyBindingOptions
  ): () => void;
  export {};
}
