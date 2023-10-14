export const Messages = {
  Renderer: {
    Common: {
      ViewReady: 'view-ready',

      GetAccentColor: 'get:accent-color',
      GetScaleFactor: 'get:scale-factor',
      GetFramelessState: 'get:is-frameless-window',
      GetSettings: 'get:settings',
      UpdateSettingsCommand: 'command:update-settings',

      ZoomInCommand: 'command:zoom-in',
      ZoomOutCommand: 'command:zoom-out',
      ResetZoomCommand: 'command:reset-zoom',
      HandlerRendererErrorCommand: 'command:handle-renderer-error',
      OpenDevToolsCommand: 'command:open-dev-tools',
      OpenUrl: 'command:open-url',

      LogInfo: 'command:log-info',
      LogWarning: 'command:log-warning',
      LogError: 'command:log-error'
    },
    About: {
      GetApplicationInfo: 'get:application-info',
      CheckForUpdatesCommand: 'command:check-for-updates'
    },
    History: {
      ShowHistorySettingsCommand: 'command:show-history-settings'
    },
    Translation: {
      ExecuteGoogleRequestCommand: 'command:execute-google-request',
      PlayingStateChange: 'command:playing-state-change',
      HistoryRecordChange: 'command:history-record-change'
    },
    Settings: {
      GetDefaultSettings: 'get:default-settings',
      GetStartupState: 'get:startup-state',

      PauseHotkeysCommand: 'command:pause-hotkeys',
      ResetSettingsCommand: 'command:reset-settings',
      OpenSettingsFileCommand: 'command:open-settings-file',
      SetStartupStateCommand: 'command:set-startup-state'
    }
  },
  Main: {
    Common: {
      AccentColorChanged: 'changed:accent-color',
      ScaleFactorChanged: 'changed:scale-factor',
      SettingsChanged: 'changed:settings'
    },
    Translation: {
      TranslateTextCommand: 'command:translate-text',
      TranslateInputCommand: 'command:translate-input',
      PlayTextCommand: 'command:play-text'
    },
    History: {
      HistoryRecordChanged: 'changed:history-record'
    },
    Settings: {
      ShowGroupCommand: 'command:show-settings-group',
      StartupStateChanged: 'changed:startup-state'
    }
  }
};
