import type { IpcRendererEvent } from 'electron';

import type { Settings, DeepPartial, SettingsGroup } from '@selected-text-translate/common';
import { Messages, createChannel } from '@selected-text-translate/common';

import type {
  ICoreApi,
  IZoomApi,
  ISettingsApi,
  ILoggingApi,
  ITranslationApi,
  IMainApi,
  IAboutApi
} from './typings/renderer.js';

const { contextBridge, ipcRenderer } = require('electron');

const coreApi: ICoreApi = {
  notifyViewReady: () => invoke(Messages.Renderer.Common.ViewReady),
  openDevTools: () => invoke(Messages.Renderer.Common.OpenDevToolsCommand),
  openUrl: (url: string) => invoke(Messages.Renderer.Common.OpenUrl, url),
  hideWindow: () => invoke(Messages.Renderer.Common.HideWindowCommand)
};

const zoomApi: IZoomApi = {
  getScaleFactor: () => invoke(Messages.Renderer.Common.GetScaleFactor),
  zoomIn: () => invoke(Messages.Renderer.Common.ZoomInCommand),
  zoomOut: () => invoke(Messages.Renderer.Common.ZoomOutCommand),
  resetZoom: () => invoke(Messages.Renderer.Common.ResetZoomCommand),
  onScaleFactorChange: callback =>
    ipcRenderer.on(
      Messages.Main.Common.ScaleFactorChanged,
      (_: IpcRendererEvent, scaleFactor: number) => callback(scaleFactor)
    )
};

const settingsApi: ISettingsApi = {
  getAccentColor: () => invoke(Messages.Renderer.Common.GetAccentColor),
  getFramelessStatus: () => invoke(Messages.Renderer.Common.GetFramelessState),
  getSettings: () => invoke(Messages.Renderer.Common.GetSettings),
  getDefaultSettings: () => invoke(Messages.Renderer.Settings.GetDefaultSettings),
  updateSettings: (settings: DeepPartial<Settings>) =>
    invoke(Messages.Renderer.Common.UpdateSettingsCommand, settings),
  pauseHotkeys: (pause: boolean) => invoke(Messages.Renderer.Settings.PauseHotkeysCommand, pause),
  getStartupState: () => invoke(Messages.Renderer.Settings.GetStartupState),
  showHistorySettings: () => invoke(Messages.Renderer.History.ShowHistorySettingsCommand),
  openSettingsFile: () => invoke(Messages.Renderer.Settings.OpenSettingsFileCommand),
  updateStartupState: (isEnabled: boolean) =>
    invoke(Messages.Renderer.Settings.SetStartupStateCommand, isEnabled),

  onAccentColorChange: callback =>
    ipcRenderer.on(Messages.Main.Common.AccentColorChanged, (_: IpcRendererEvent, color: string) =>
      callback(color)
    ),
  onSettingsChange: callback =>
    ipcRenderer.on(
      Messages.Main.Common.SettingsChanged,
      (_: IpcRendererEvent, settings: Settings) => callback(settings)
    ),
  onSettingsGroupChange: callback =>
    ipcRenderer.on(
      Messages.Main.Settings.ShowGroupCommand,
      (_: IpcRendererEvent, group: SettingsGroup) => callback(group)
    )
};

const loggingApi: ILoggingApi = {
  notifyOnError: (error: Error, message?: string) =>
    invoke<void, [Error, string?]>(
      Messages.Renderer.Common.HandlerRendererErrorCommand,
      error,
      message
    ),
  logInfo: message => invoke(Messages.Renderer.Common.LogInfo, message),
  logWarning: message => invoke(Messages.Renderer.Common.LogWarning, message),
  logError: (error, message) => invoke(Messages.Renderer.Common.LogError, error, message)
};

const translationApi: ITranslationApi = {
  executeGoogleRequest: <TContent>(rpcId: string, data: string) =>
    invoke<TContent, [string, string]>(
      Messages.Renderer.Translation.ExecuteGoogleRequestCommand,
      rpcId,
      data
    ),
  setPlayingState: (isPlaying: boolean) =>
    invoke(Messages.Renderer.Translation.PlayingStateChange, isPlaying),
  historyRecordChange: (id: string) =>
    invoke(Messages.Renderer.Translation.HistoryRecordChange, id),
  onHistoryRecordChange: callback =>
    ipcRenderer.on(Messages.Main.History.HistoryRecordChanged, (_: IpcRendererEvent, id: string) =>
      callback(id)
    ),
  onTranslateText: callback =>
    ipcRenderer.on(
      Messages.Main.Translation.TranslateTextCommand,
      (_: IpcRendererEvent, text: string, showDefinitions: boolean) =>
        callback(text, showDefinitions)
    ),
  onPlayText: callback =>
    ipcRenderer.on(Messages.Main.Translation.PlayTextCommand, (_: IpcRendererEvent, text: string) =>
      callback(text)
    ),
  onShowTextInput: callback =>
    ipcRenderer.on(Messages.Main.Translation.TranslateInputCommand, () => callback())
};

const aboutApi: IAboutApi = {
  getApplicationInfo: () => invoke(Messages.Renderer.About.GetApplicationInfo),
  checkForUpdates: () => invoke(Messages.Renderer.About.CheckForUpdatesCommand)
};

const mainApi: IMainApi = {
  core: coreApi,
  zoom: zoomApi,
  settings: settingsApi,
  logging: loggingApi,
  translation: translationApi,
  about: aboutApi
};

contextBridge.exposeInMainWorld('mainAPI', mainApi);

function invoke<TResult, TArgs extends unknown[]>(
  message: string,
  ...args: TArgs
): Promise<TResult> {
  return ipcRenderer.invoke(createChannel(message, getWindowId()), ...args);
}

function getWindowId(): string {
  const match = window.location.hash.match(/id=(?<id>\d+)/);
  return match?.groups?.id ?? '';
}
