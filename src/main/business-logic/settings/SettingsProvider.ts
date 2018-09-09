import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";

import { Language } from "common/dto/settings/Language";

import { SettingsStore } from "infrastructure/SettingsStore";
import { DeepPartial } from "utils/deep-partial";
import { readJsonFile } from "utils/read-json";

import { Settings } from "business-logic/settings/dto/Settings";

@injectable()
export class SettingsProvider {

    private settings$: BehaviorSubject<Settings> | null = null;

    constructor(private readonly settingsStore: SettingsStore) {
    }

    public getSettings(): BehaviorSubject<Settings> {
        if (this.settings$ === null) {
            this.settings$ = new BehaviorSubject(this.settingsStore.getSettings());
        }

        return this.settings$;
    }

    public updateSettings(settings: DeepPartial<Settings>): void {
        this.settingsStore.updateSettings(settings);
        if (!!this.settings$) {
            this.settings$.next(this.settingsStore.getSettings());
        }
    }

    public getDefaultSettings(): Settings {
        return this.settingsStore.getDefaultSettings();
    }

    public openInEditor(): void {
        this.settingsStore.openInEditor();
    }

    public getLanguages(): ReadonlyArray<Language> {
        return readJsonFile("languages.json") as Language[];
    }
}