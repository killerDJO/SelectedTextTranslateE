export enum Channels {
    Subscribe = "subscribe",
    Observe = "observe",
    Received = "received"
}

export class Messages {

    public static Common = class {
        public static readonly AccentColor = "accent-color";
        public static readonly ScaleFactor = "scale-factor";
        public static readonly IsFramelessWindow = "is-frameless-window";

        public static readonly ZoomInCommand = "zoom-in";
        public static readonly ZoomOutCommand = "zoom-out";
        public static readonly ResetZoomCommand = "reset-zoom";

        public static readonly RendererSettings = "renderer-settings";
        public static readonly RendererError = "renderer-error";
    };

    public static Translation = class {
        public static readonly ShowInputCommand = "input-text-command";
    };

    public static TranslateResult = class {
        public static readonly InProgressCommand = "set-in-progress";
        public static readonly TranslateResult = "translate-result";
        public static readonly Languages = "translate-result-languages";
        public static readonly UpdateTranslateResult = "update-translate-result";
        public static readonly PlayTextCommand = "play-text-command";
        public static readonly TranslateCommand = "translate-command";
        public static readonly TranslationResultViewSettings = "translation-result-view-settings";
        public static readonly StarTranslateResult = "star-translate-result";
        public static readonly Search = "search";
    };

    public static History = class {
        public static readonly HistoryRecords = "history-records";
        public static readonly ArchiveRecord = "archive-record";
        public static readonly RequestHistoryRecords = "get-history-records";
        public static readonly HistoryUpdated = "history-updated";
    };

    public static HistorySync = class {
        public static readonly HistoryRecords = "history-records-sync";
        public static readonly UpdateRecord = "history-record-update";
        public static readonly MergeRecord = "history-record-merge";
    };

    public static Settings = class {
        public static readonly EditableSettings = "editable-settings";
        public static readonly DefaultEditableSettings = "default-editable-settings";
        public static readonly ScalingState = "scaling-state";
        public static readonly StartupState = "startup-state";
        public static readonly EditableSettingsUpdated = "editable-settings-updated";
        public static readonly PauseHotkeysRequest = "pause-hotkeys-request";
        public static readonly SetScaleFactorCommand = "set-scale-factor";
        public static readonly SetStartupStateCommand = "set-startup-state";
        public static readonly OpenSettingsFile = "open-settings-file";
    };
}