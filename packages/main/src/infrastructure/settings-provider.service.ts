import Store = require('electron-store');
import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { isPlainObject } from 'lodash';
import { dump, load } from 'js-yaml';

import { Settings, DeepPartial } from '@selected-text-translate/common';

import { defaultSettings } from '~/default-settings';
import languages from '~/languages.json';

type DefaultSettings = typeof defaultSettings;

@injectable()
export class SettingsProvider {
  private readonly store = new Store({
    name: 'settings',
    fileExtension: 'yaml',
    serialize: dump,
    deserialize: load as (text: string) => Record<string, unknown>
  });
  private settings$: BehaviorSubject<Settings> | null = null;

  public getSettings(): BehaviorSubject<Settings> {
    if (this.settings$ === null) {
      this.settings$ = new BehaviorSubject(this.loadSettings());
    }

    return this.settings$;
  }

  public updateSettings(settings: DeepPartial<Settings>): void {
    this.updateIndividualSettings(settings, '');
    this.settings$?.next(this.loadSettings());
  }

  public resetSettings(): void {
    this.store.clear();
    this.settings$?.next(this.loadSettings());
  }

  public openInEditor(): void {
    this.store.openInEditor();
  }

  public getDefaultSettings(): DefaultSettings {
    return defaultSettings;
  }

  private loadSettings(): Settings {
    const defaultSettings = this.getDefaultSettings();
    const combinedSettings = this.getSettingsByDefaultSettings(defaultSettings, '');

    const languagesMap = new Map<string, string>();
    for (const language of languages) {
      languagesMap.set(language.code, language.name);
    }
    combinedSettings.supportedLanguages = languagesMap;

    return combinedSettings as unknown as Settings;
  }

  private getSettingsByDefaultSettings(
    currentDefaultSettings: Record<string, unknown>,
    parentPath: string
  ): Record<string, unknown> {
    const currentSettings: Record<string, unknown> = {};
    const settingsKeys = Object.keys(currentDefaultSettings);

    for (const key of settingsKeys) {
      const currentPath = this.getCurrentPath(parentPath, key);
      currentSettings[key] = isPlainObject(currentDefaultSettings[key])
        ? this.getSettingsByDefaultSettings(
            currentDefaultSettings[key] as Record<string, unknown>,
            currentPath
          )
        : this.getOrDefault(currentPath, currentDefaultSettings[key]);
    }

    return currentSettings;
  }

  private getOrDefault<TValue>(name: string, defaultValue: TValue): TValue {
    if (!this.store.has(name)) {
      return defaultValue;
    }

    const value = this.store.get(name) as TValue;
    return value;
  }

  private updateIndividualSettings(
    currentSetting: Record<string, unknown>,
    parentPath: string
  ): void {
    for (const key of Object.keys(currentSetting)) {
      const currentPath = this.getCurrentPath(parentPath, key);
      if (isPlainObject(currentSetting[key])) {
        this.updateIndividualSettings(currentSetting[key] as Record<string, unknown>, currentPath);
      } else {
        this.store.set(currentPath, currentSetting[key]);
      }
    }
  }

  private getCurrentPath(parentPath: string, key: string): string {
    return !!parentPath ? `${parentPath}.${key}` : key;
  }
}
