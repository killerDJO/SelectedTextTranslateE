import { Settings } from "./dto/Settings";
import { injectable } from "inversify";
import { SettingsStore } from "infrastructure/SettingsStore";

@injectable()
export class SettingsProvider {

    private cachedSettings: Settings | null = null;

    constructor(private readonly settingsStore: SettingsStore) {
    }

    public getSettings(): Settings {
        if (this.cachedSettings === null) {
            this.cachedSettings = {
                presentation: {
                    score: {
                        highThreshold: this.settingsStore.getOrSetDefault<number>("presentation.score.highThreshold", 0.05),
                        mediumThreshold: this.settingsStore.getOrSetDefault<number>("presentation.score.mediumThreshold", 0.0025)
                    },
                    visibility: {
                        lowScoreThreshold: this.settingsStore.getOrSetDefault<number>("presentation.visibility.lowScoreThreshold", 0.003),
                        visibleByDefaultNumber: this.settingsStore.getOrSetDefault<number>("presentation.visibility.visibleByDefaultNumber", 7)
                    }
                },
                engine: {
                    copyDelayMilliseconds: this.settingsStore.getOrSetDefault<number>("engine.copyDelayMilliseconds", 100),
                    baseUrl: this.settingsStore.getOrSetDefault<string>("engine.baseUrl", "https://translate.google.com"),
                    dictionaryRefreshInterval: this.settingsStore.getOrSetDefault<number>("engine.dictionaryRefreshInterval", 30)
                }
            };
        }

        return this.cachedSettings;
    }
}