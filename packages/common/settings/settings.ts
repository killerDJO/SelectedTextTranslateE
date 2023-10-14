export interface Settings {
  readonly renderer: RendererSettings;
  readonly engine: TranslationEngineSettings;
  readonly views: ViewsSettings;
  readonly scaling: ScalingSettings;
  readonly hotkeys: HotkeySettings;
  readonly update: UpdateSettings;
  readonly language: LanguageSettings;
  readonly search: SearchSettings;
  readonly firebase: FirebaseSettings;
  readonly tags: TagSettings;
  readonly supportedLanguages: Map<string, string>;
  readonly logging: LoggingSettings;
}

export interface LoggingSettings {
  readonly maxLogSize: number;
  readonly logFileName: string;
}

export interface HotkeySettings {
  readonly translate: Hotkey[];
  readonly showDefinition: Hotkey[];
  readonly playText: Hotkey[];
  readonly inputText: Hotkey[];
  readonly toggleSuspend: Hotkey[];
}

export interface TranslationEngineSettings {
  readonly copyDelayMilliseconds: number;
  readonly userAgent: string;
  readonly requestTimeout: number;
  readonly proxy: ProxySettings;
  readonly playVolume: number;
  readonly enableRequestsLogging: boolean;
}

export interface ProxySettings {
  readonly isEnabled: boolean;
  readonly url: string;
}

export interface ViewsSettings {
  readonly translation: TranslationViewSettings;
  readonly settings: ViewSize;
  readonly about: ViewSize;
  readonly history: HistoryViewSettings;
}

export interface ViewSize {
  readonly width: number;
  readonly height: number;
}

export interface ScalingSettings {
  readonly verticalResolutionBaseline: number;
  readonly scalingStep: number;
  readonly minScaling: number;
  readonly maxScaling: number;
  readonly scaleTranslationViewOnly: boolean;
  readonly scaleFactor: number;
}

export interface TranslationViewSettings extends ViewSize {
  readonly margin: number;
  readonly x?: number | null;
  readonly y?: number | null;
  readonly renderer: TranslateResultRendererSettings;
}

export interface HistoryViewSettings extends ViewSize {
  readonly renderer: HistoryViewRendererSettings;
}

export interface UpdateSettings {
  readonly feedUrl: string;
  readonly releasesUrl: string;
}

export interface SearchSettings {
  readonly searchPattern: string;
}

export interface TagSettings {
  readonly currentTags: ReadonlyArray<string | Tag>;
}

export interface FirebaseSettings {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
}

export interface HistoryViewRendererSettings {
  readonly pageSize: number;
  readonly lastRecordsToScanForMerge: number;
  readonly columns: ReadonlyArray<ColumnSettings>;
}

export interface ColumnSettings {
  readonly column: HistorySortColumn;
  readonly isVisible: boolean;
  readonly weight: number;
}

export enum HistorySortColumn {
  Input = 'Input',
  TimesTranslated = 'TimesTranslated',
  LastTranslatedDate = 'LastTranslatedDate',
  Translation = 'Translation',
  SourceLanguage = 'SourceLanguage',
  TargetLanguage = 'TargetLanguage',
  IsArchived = 'IsArchived',
  Tags = 'Tags'
}

export interface Hotkey {
  readonly keys: string[];
}

export interface LanguageSettings {
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
}

export interface Language {
  readonly code: string;
  readonly name: string;
}

export interface RendererSettings {
  readonly hotkeys: RendererHotkeySettings;
}

export interface RendererHotkeySettings {
  readonly zoomIn: Hotkey[];
  readonly zoomOut: Hotkey[];
  readonly resetZoom: Hotkey[];
}

export interface TranslateResultRendererSettings {
  readonly visibility: ResultVisibilitySettings;
  readonly toggleDefinitionHotkey: Hotkey[];
  readonly archiveResultHotkey: Hotkey[];
  readonly toggleTagsHotkey: Hotkey[];
  readonly addTagHotkey: Hotkey[];
}

export interface ResultVisibilitySettings {
  readonly visibleByDefaultNumber: number;
}

export interface Tag {
  readonly tag: string;
  readonly isEnabled: boolean;
}
