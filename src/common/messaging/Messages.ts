export enum Channels {
    Subscribe = "subscribe",
    Observe = "observe"
}

export enum Messages {
    AccentColor = "accent-color",
    ScaleFactor = "scale-factor",
    IsFramelessWindow = "is-frameless-window",

    TranslateResult = "translate-result",

    PlayTextCommand = "play-text-command",
    TranslateCommand = "translate-command",
    ForceTranslateCommand = "force-translate-command",

    ZoomInCommand = "zoom-in",
    ZoomOutCommand = "zoom-out",

    RendererError = "renderer-error",

    HistoryRecords = "history-records",
    RequestHistoryRecords = "get-history-records",
    HistoryUpdated = "history-updated",

    RendererSettings = "renderer-settings",
    EditableSettings = "editable-settings",
    TranslationResultViewSettings = "translation-result-view-settings",
    EditableSettingsUpdated = "editable-settings-updated",
    PauseHotkeys = "pause-hotkeys",
}