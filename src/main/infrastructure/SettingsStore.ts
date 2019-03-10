import Store = require("electron-store");
import { injectable } from "inversify";
import * as _ from "lodash";

import { readJsonFile } from "utils/read-json";

@injectable()
export class SettingsStore {
    private readonly store: Store = new Store();

    public openInEditor(): void {
        this.store.openInEditor();
    }

    public get(name: string): any {
        return this.store.get(name);
    }

    public getSettings(): any {
        const defaultSettings = this.getDefaultSettings();
        return this.getSettingsByDefaultSettings(defaultSettings, "");
    }

    public updateSettings(settings: any): void {
        this.updateIndividualSettings(settings, "");
    }

    public getDefaultSettings(): any {
        return readJsonFile("default-settings.json");
    }

    private getOrSetDefault<TValue>(name: string, defaultValue: TValue, key: string, settings: any): TValue {
        if (!this.store.has(name)) {
            this.set(name, defaultValue);
            return defaultValue;
        }

        const value = this.store.get(name);
        if (_.isArray(value)) {
            const arrayKey = settings[`$${key}.key`];
            if (!!arrayKey) {
                this.mergeArrayValues(value, defaultValue, arrayKey);
                this.set(name, value);
            }
        }

        return value;
    }

    private mergeArrayValues(value: any, defaultValue: any, keyName: string): void {
        for (const item of value) {
            const key = item[keyName];
            const defaultItem = defaultValue.find((x: any) => x[keyName] === key);
            for (const property of Object.keys(defaultItem)) {
                if (!_.has(item, property)) {
                    item[property] = defaultItem[property];
                }
            }
        }
    }

    private set<TValue>(name: string, value: TValue) {
        this.store.set(name, value);
    }

    private getSettingsByDefaultSettings(currentDefaultSettings: any, parentPath: string): any {
        const currentSettings: any = {};
        for (const key of Object.keys(currentDefaultSettings).filter(settingKey => !settingKey.startsWith("$"))) {
            const currentPath = this.getCurrentPath(parentPath, key);
            currentSettings[key] = _.isPlainObject(currentDefaultSettings[key])
                ? this.getSettingsByDefaultSettings(currentDefaultSettings[key], currentPath)
                : this.getOrSetDefault(currentPath, currentDefaultSettings[key], key, currentDefaultSettings);
        }

        return currentSettings;
    }

    private updateIndividualSettings(currentSetting: any, parentPath: string): void {
        for (const key of Object.keys(currentSetting)) {
            const currentPath = this.getCurrentPath(parentPath, key);
            if (_.isPlainObject(currentSetting[key])) {
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