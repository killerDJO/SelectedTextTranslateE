import Store = require('electron-store');
import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { has, isArray, isPlainObject } from 'lodash';

import { Settings, DeepPartial } from '@selected-text-translate/common';

import defaultSettings from '~/default-settings.json';
import languages from '~/languages.json';

type DefaultSettings = typeof defaultSettings;

@injectable()
export class SettingsProvider {
  private readonly store: Store = new Store();
  private settings$: BehaviorSubject<Settings> | null = null;

  public getSettings(): BehaviorSubject<Settings> {
    if (this.settings$ === null) {
      this.settings$ = new BehaviorSubject(this.loadSettings());
    }

    return this.settings$;
  }

  public updateSettings(settings: DeepPartial<Settings>): void {
    this.updateIndividualSettings(settings, '');
    if (!!this.settings$) {
      this.settings$.next(this.loadSettings());
    }
  }

  public resetSettings(): void {
    this.updateSettings(this.getDefaultSettings() as DeepPartial<Settings>);
  }

  public openInEditor(): void {
    this.store.openInEditor();
  }

  public getDefaultSettings(): DefaultSettings {
    return defaultSettings;
  }

  private loadSettings(): Settings {
    const defaultSettings = this.getDefaultSettings();
    const mainSettings = this.getSettingsByDefaultSettings(defaultSettings, '');

    const languagesMap = new Map<string, string>();
    for (const language of languages) {
      languagesMap.set(language.code, language.name);
    }
    mainSettings.supportedLanguages = languagesMap;

    return mainSettings as unknown as Settings;
  }

  private getSettingsByDefaultSettings(
    currentDefaultSettings: Record<string, unknown>,
    parentPath: string
  ): Record<string, unknown> {
    const currentSettings: Record<string, unknown> = {};
    const settingsKeys = Object.keys(currentDefaultSettings).filter(
      settingKey => !settingKey.startsWith('$')
    );

    for (const key of settingsKeys) {
      const currentPath = this.getCurrentPath(parentPath, key);
      currentSettings[key] = isPlainObject(currentDefaultSettings[key])
        ? this.getSettingsByDefaultSettings(
            currentDefaultSettings[key] as Record<string, unknown>,
            currentPath
          )
        : this.getOrSetDefault(
            currentPath,
            currentDefaultSettings[key],
            key,
            currentDefaultSettings
          );
    }

    return currentSettings;
  }

  private getOrSetDefault<TValue>(
    name: string,
    defaultValue: TValue,
    key: string,
    settings: Record<string, unknown>
  ): TValue {
    if (!this.store.has(name)) {
      this.set(name, defaultValue);
      return defaultValue;
    }

    const value = this.store.get(name) as TValue;
    if (isArray(value)) {
      const arrayKey = settings[`$${key}.key`];
      if (!!arrayKey && isArray(defaultValue)) {
        this.mergeArrayValues(value, defaultValue, arrayKey as string);
        this.set(name, value);
      }
    }

    return value;
  }

  private set<TValue>(name: string, value: TValue): void {
    this.store.set(name, value);
  }

  private mergeArrayValues(
    value: Record<string, unknown>[],
    defaultValue: Record<string, unknown>[],
    keyName: string
  ): void {
    for (const item of value) {
      const key = item[keyName];
      const defaultItem = defaultValue.find(x => x[keyName] === key);
      if (!defaultItem) {
        continue;
      }

      for (const property of Object.keys(defaultItem)) {
        if (!has(item, property)) {
          item[property] = defaultItem[property];
        }
      }
    }
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
        this.set(currentPath, currentSetting[key]);
      }
    }
  }

  private getCurrentPath(parentPath: string, key: string): string {
    return !!parentPath ? `${parentPath}.${key}` : key;
  }
}
