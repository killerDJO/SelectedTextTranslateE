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
        public static readonly LanguageSettings = "language-settings";
    };

    public static About = class {
        public static readonly ApplicationInfo = "about-application-info";
        public static readonly CheckForUpdates = "about-check-for-updates";
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
        public static readonly ArchiveResult = "archive-result";
        public static readonly UpdateTags = "update-tags";
        public static readonly GetTagSuggestions = "get-tag-suggestions";
        public static readonly Search = "search";
    };

    public static History = class {
        public static readonly HistoryRecords = "history-records";
        public static readonly ArchiveRecord = "archive-record";
        public static readonly RequestHistoryRecords = "get-history-records";
        public static readonly HistoryUpdated = "history-updated";

        public static readonly SignIn = "history-sign-in";
        public static readonly SignUp = "history-sign-up";
        public static readonly SignOut = "history-sign-out";
        public static readonly SendPasswordResetToken = "history-send-password-reset-token";
        public static readonly VerifyPasswordResetToken = "history-verify-password-reset-token";
        public static readonly ResetPassword = "history-reset-password";
        public static readonly ChangePassword = "history-change-password";
        public static readonly SyncOneTime = "history-one-time";
        public static readonly SyncOneTimeForced = "history-one-time-forced";
        public static readonly ShowHistorySettings = "show-history-settings";
        public static readonly CurrentUser = "history-current-user";
        public static readonly StoredUser = "history-stored-user";
        public static readonly SyncState = "history-sync-state";
        public static readonly AutoSignInState = "history-sync-state";
        public static readonly ClearStoredUser = "history-clear-stored-user";
        public static readonly SignInStoredUser = "history-sign-in-stored-user";

        public static readonly CurrentTags = "history-current-tags";
        public static readonly UpdateCurrentTags = "history-update-current-tags";

        public static readonly HistorySettings = "history-settings";
        public static readonly UpdateColumnSettings = "history-update-column-settings";

        public static Merging = class {
            public static readonly MergeCandidates = "merge-candidates";
            public static readonly MergeRequest = "merge-request";
            public static readonly BlacklistRequest = "blacklist-request";
        };
    };

    public static HistorySync = class {
        public static readonly StartSync = "start-history-records-sync";
        public static readonly StopSync = "stop-history-records-sync";
        public static readonly UnSyncedHistoryRecords = "unsynced-history-records";
        public static readonly HistoryRecord = "history-record-sync";
        public static readonly FirebaseSettings = "firebase-settings";
        public static readonly HistorySyncSettings = "history-sync-settings";
        public static readonly UserInfo = "history-user-info";
        public static readonly UpdateRecord = "history-record-update";
        public static readonly MergeRecord = "history-record-merge";
        public static readonly LastSyncTime = "last-sync-time";
        public static readonly SetLastSyncTime = "set-last-sync-time";

        public static readonly CurrentUser = "current-user";
        public static readonly IsSyncInProgress = "is-sync-in-progress";
        public static readonly SignIn = "sign-in";
        public static readonly SignUp = "sign-up";
        public static readonly SignOut = "sign-out";
        public static readonly SendPasswordResetToken = "send-password-reset-token";
        public static readonly VerifyPasswordResetToken = "verify-password-reset-token";
        public static readonly ResetPassword = "reset-password";
        public static readonly ChangePassword = "change-password";
    };

    public static Settings = class {
        public static readonly EditableSettings = "editable-settings";
        public static readonly DefaultEditableSettings = "default-editable-settings";
        public static readonly ScalingState = "scaling-state";
        public static readonly SettingsGroup = "settings-group";
        public static readonly StartupState = "startup-state";
        public static readonly EditableSettingsUpdated = "editable-settings-updated";
        public static readonly PauseHotkeysRequest = "pause-hotkeys-request";
        public static readonly SetScaleFactorCommand = "set-scale-factor";
        public static readonly SetStartupStateCommand = "set-startup-state";
        public static readonly OpenSettingsFile = "open-settings-file";
        public static readonly ResetSettings = "reset-all-settings";
    };

    public static ServiceRenderer = class {
        public static readonly LogInfo = "service-renderer-log-info";
        public static readonly LogError = "service-renderer-log-error";
        public static readonly LogWarning = "service-renderer-log-warning";

        public static readonly PlayFile = "service-renderer-play-file";
        public static readonly MergeCandidates = "service-renderer-merge-candidates";
    };
}