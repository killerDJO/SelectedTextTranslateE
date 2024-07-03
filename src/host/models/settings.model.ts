export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Settings = {
  core: CoreSettings;
  translation: TranslationSettings;
  display: DisplaySettings;
  translationWindow: TranslationWindowSettings;
  historyWindow: WindowSettings;
  settingsWindow: WindowSettings;
  scaling: ScalingSettings;
  hotkeys: HotkeySettings;
  firebase: FirebaseSettings;
};

export type PartialSettings = DeepPartial<Settings>;

export type CoreSettings = {
  copyDelayMilliseconds: number;
  requestTimeoutMilliseconds: number;
  playVolume: number;
  searchPattern: string;
  lastRecordsToScanForMerge: number;
};

export type TranslationSettings = {
  sourceLanguage: string;
  targetLanguage: string;
  tags: Tag[];
};

export type Tag = {
  tag: string;
  enabled: boolean;
};

export type DisplaySettings = {
  visibleByDefaultTranslationsInCategory: number;
  historyPageSize: number;
  historyColumns: HistoryColumns;
};

export type HistoryColumns = {
  input: HistoryColumn;
  translation: HistoryColumn;
  tags: HistoryColumn;
  timesTranslated: HistoryColumn;
  lastTranslatedDate: HistoryColumn;
  sourceLanguage: HistoryColumn;
  targetLanguage: HistoryColumn;
  archived: HistoryColumn;
};

export type HistoryColumnName = keyof HistoryColumns;

export type HistoryColumn = {
  visible: boolean;
  weight: number;
  index: number;
};

export type TranslationWindowSettings = {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  x: number | null;
  y: number | null;
  margin: number;
};

export type WindowSettings = {
  widthPercentage: number;
  heightPercentage: number;
  minWidth: number;
  minHeight: number;
};

export type ScalingSettings = {
  scaleFactor: number;
  scaleTranslationViewOnly: boolean;
  scalingStep: number;
  minScaling: number;
  maxScaling: number;
  verticalResolutionBaseline: number;
};

export type Keys = string[];

export type HotkeySettings = {
  translate: Keys[];
  playText: Keys[];
  showDefinition: Keys[];
  inputText: Keys[];
  toggleSuspend: Keys[];
  zoomIn: Keys[];
  zoomOut: Keys[];
  resetZoom: Keys[];
  toggleDefinition: Keys[];
  archiveResult: Keys[];
  addTag: Keys[];
  toggleTags: Keys[];
};

export type FirebaseSettings = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};
