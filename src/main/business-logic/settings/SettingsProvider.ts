import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import * as path from "path";
import * as fs from "fs";
import * as _ from "lodash";

import { Settings } from "business-logic/settings/dto/Settings";
import { SettingsStore } from "infrastructure/SettingsStore";
import { DeepPartial } from "utils/deep-partial";

@injectable()
export class SettingsProvider {

    private settings$: BehaviorSubject<Settings> | null = null;

    constructor(private readonly settingsStore: SettingsStore) {
    }

    public getSettings(): BehaviorSubject<Settings> {
        if (this.settings$ === null) {
            this.settings$ = new BehaviorSubject(this.getSettingsFromDefaultsFile());
        }

        return this.settings$;
    }

    public updateSettings(settings: DeepPartial<Settings>): void {
        this.updateIndividualSettings(settings, "");
        if (!!this.settings$) {
            this.settings$.next(this.getSettingsFromDefaultsFile());
        }
    }

    private getSettingsFromDefaultsFile(): Settings {
        const defaultSettingsPath = path.resolve(__dirname, "default-settings.json");
        const defaultSettingsContent = fs.readFileSync(defaultSettingsPath).toString("utf8");
        const defaultSettings = JSON.parse(defaultSettingsContent);
        const settings = this.getSettingsFromDefault(defaultSettings, "") as Settings;
        return settings;
    }

    private getSettingsFromDefault(currentDefaultSettings: any, parentPath: string): any {
        const currentSettings: any = {};
        for (const key of Object.keys(currentDefaultSettings)) {
            const currentPath = this.getCurrentPath(parentPath, key);
            currentSettings[key] = _.isPlainObject(currentDefaultSettings[key])
                ? this.getSettingsFromDefault(currentDefaultSettings[key], currentPath)
                : this.settingsStore.getOrSetDefault(currentPath, currentDefaultSettings[key]);
        }

        return currentSettings;
    }

    private updateIndividualSettings(currentSetting: any, parentPath: string): void {
        for (const key of Object.keys(currentSetting)) {
            const currentPath = this.getCurrentPath(parentPath, key);
            if (_.isPlainObject(currentSetting[key])) {
                this.updateIndividualSettings(currentSetting[key], currentPath);
            } else {
                this.settingsStore.set(currentPath, currentSetting[key]);
            }
        }
    }

    private getCurrentPath(parentPath: string, key: string): string {
        return !!parentPath ? `${parentPath}.${key}` : key;
    }
}