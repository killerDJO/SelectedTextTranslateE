import Store = require('electron-store');
import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { has, isArray, isPlainObject } from 'lodash';

import { Settings } from '@selected-text-translate/common/settings/Settings';
import { DeepPartial } from '@selected-text-translate/common/typings/deep-partial';

import * as defaultSettings from '~/default-settings.json';
import * as languages from '~/languages.json';

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
    this.updateSettings(this.getDefaultSettings());
  }

  public openInEditor(): void {
    this.store.openInEditor();
  }

  public getDefaultSettings(): any {
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

    return mainSettings;
  }

  private getSettingsByDefaultSettings(currentDefaultSettings: any, parentPath: string): any {
    const currentSettings: any = {};
    for (const key of Object.keys(currentDefaultSettings).filter(
      settingKey => !settingKey.startsWith('$')
    )) {
      const currentPath = this.getCurrentPath(parentPath, key);
      currentSettings[key] = isPlainObject(currentDefaultSettings[key])
        ? this.getSettingsByDefaultSettings(currentDefaultSettings[key], currentPath)
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
    settings: any
  ): TValue {
    if (!this.store.has(name)) {
      this.set(name, defaultValue);
      return defaultValue;
    }

    const value = this.store.get(name) as TValue;
    if (isArray(value)) {
      const arrayKey = settings[`$${key}.key`];
      if (!!arrayKey) {
        this.mergeArrayValues(value, defaultValue, arrayKey);
        this.set(name, value);
      }
    }

    return value;
  }

  private set<TValue>(name: string, value: TValue): void {
    this.store.set(name, value);
  }

  private mergeArrayValues(value: any, defaultValue: any, keyName: string): void {
    for (const item of value) {
      const key = item[keyName];
      const defaultItem = defaultValue.find((x: any) => x[keyName] === key);
      for (const property of Object.keys(defaultItem)) {
        if (!has(item, property)) {
          item[property] = defaultItem[property];
        }
      }
    }
  }

  private updateIndividualSettings(currentSetting: any, parentPath: string): void {
    for (const key of Object.keys(currentSetting)) {
      const currentPath = this.getCurrentPath(parentPath, key);
      if (isPlainObject(currentSetting[key])) {
        this.updateIndividualSettings(currentSetting[key], currentPath);
      } else {
        this.set(currentPath, currentSetting[key]);
      }
    }
  }

  private getCurrentPath(parentPath: string, key: string): string {
    return !!parentPath ? `${parentPath}.${key}` : key;
  }
}
