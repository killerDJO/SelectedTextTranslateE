import type { Hotkey } from '@selected-text-translate/common/settings/settings';

export interface EditableHotkeySettings {
  readonly global: GlobalHotkeySettings;
  readonly local: LocalHotkeySettings;
}

export interface GlobalHotkeySettings {
  readonly translate: Hotkey[];
  readonly playText: Hotkey[];
  readonly showDefinition: Hotkey[];
  readonly inputText: Hotkey[];
  readonly toggleSuspend: Hotkey[];
}

export interface LocalHotkeySettings {
  readonly zoomIn: Hotkey[];
  readonly zoomOut: Hotkey[];
  readonly resetZoom: Hotkey[];
  readonly toggleDefinition: Hotkey[];
  readonly toggleTags: Hotkey[];
  readonly addTag: Hotkey[];
  readonly archiveResult: Hotkey[];
}
