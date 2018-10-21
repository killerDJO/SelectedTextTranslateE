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

    private getOrSetDefault<TValue>(name: string, defaultValue: TValue): TValue {
        if (!this.store.has(name)) {
            this.set(name, defaultValue);
            return defaultValue;
        }

        return this.store.get(name);
    }

    private set<TValue>(name: string, value: TValue) {
        this.store.set(name, value);
    }

    private getSettingsByDefaultSettings(currentDefaultSettings: any, parentPath: string): any {
        const currentSettings: any = {};
        for (const key of Object.keys(currentDefaultSettings)) {
            const currentPath = this.getCurrentPath(parentPath, key);
            currentSettings[key] = _.isPlainObject(currentDefaultSettings[key])
                ? this.getSettingsByDefaultSettings(currentDefaultSettings[key], currentPath)
                : this.getOrSetDefault(currentPath, currentDefaultSettings[key]);
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