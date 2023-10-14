import type { Settings } from '@selected-text-translate/common/settings/settings';
import type { SettingsGroup } from '@selected-text-translate/common/settings/settings-group';
import type { DeepPartial } from '@selected-text-translate/common/typings/deep-partial';
import type { ApplicationInfo } from '@selected-text-translate/common/messaging/about';

export interface ICoreApi {
  notifyViewReady: () => Promise<void>;
  openDevTools: () => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  hideWindow: () => Promise<void>;
}

export interface IZoomApi {
  getScaleFactor: () => Promise<number>;
  zoomIn: () => Promise<void>;
  zoomOut: () => Promise<void>;
  resetZoom: () => Promise<void>;
  onScaleFactorChange: (callback: (scaleFactor: number) => void) => void;
}

export interface ISettingsApi {
  getAccentColor: () => Promise<string>;
  getFramelessStatus: () => Promise<boolean>;
  getDefaultSettings: () => Promise<Settings>;
  pauseHotkeys: (pause: boolean) => Promise<void>;
  showHistorySettings: () => Promise<void>;
  getSettings: () => Promise<Settings>;
  getStartupState: () => Promise<boolean>;
  updateSettings: (settings: DeepPartial<Settings>) => Promise<void>;
  openSettingsFile: () => Promise<void>;
  updateStartupState: (isEnabled: boolean) => Promise<void>;
  onAccentColorChange: (callback: (color: string) => void) => void;
  onSettingsChange: (callback: (rendererSettings: Settings) => void) => void;
  onSettingsGroupChange: (callback: (group: SettingsGroup) => void) => void;
}

export interface ILoggingApi {
  notifyOnError: (error: Error, message?: string) => Promise<void>;
  logInfo: (message: string) => Promise<void>;
  logWarning: (message: string) => Promise<void>;
  logError: (error: Error, message: string) => Promise<void>;
}

export interface ITranslationApi {
  onTranslateText: (callback: (test: string, showDefinitions: boolean) => void) => void;
  onPlayText: (callback: (text: string) => void) => void;
  onShowTextInput: (callback: () => void) => void;
  executeGoogleRequest: <TContent>(rpcId: string, data: string) => Promise<TContent>;
  setPlayingState: (isPlaying: boolean) => Promise<void>;
  historyRecordChange: (id: string) => Promise<void>;
  onHistoryRecordChange: (callback: (id: string) => void) => void;
}

export interface IAboutApi {
  getApplicationInfo: () => Promise<ApplicationInfo>;
  checkForUpdates: () => Promise<void>;
}

export interface IMainApi {
  core: ICoreApi;
  zoom: IZoomApi;
  settings: ISettingsApi;
  logging: ILoggingApi;
  translation: ITranslationApi;
  about: IAboutApi;
}

declare global {
  interface Window {
    mainAPI: IMainApi;
  }
}
