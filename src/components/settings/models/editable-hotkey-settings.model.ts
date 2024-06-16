import { Keys } from '~/host/models/settings.model';

export interface EditableHotkeySettings {
  readonly global: GlobalHotkeySettings;
  readonly local: LocalHotkeySettings;
}

export interface GlobalHotkeySettings {
  readonly translate: Keys[];
  readonly playText: Keys[];
  readonly showDefinition: Keys[];
  readonly inputText: Keys[];
  readonly toggleSuspend: Keys[];
}

export interface LocalHotkeySettings {
  readonly zoomIn: Keys[];
  readonly zoomOut: Keys[];
  readonly resetZoom: Keys[];
  readonly toggleDefinition: Keys[];
  readonly toggleTags: Keys[];
  readonly addTag: Keys[];
  readonly archiveResult: Keys[];
}
