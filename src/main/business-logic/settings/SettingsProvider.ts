import { Settings } from "./dto/Settings";
import { injectable } from "inversify";
import { SettingsStore } from "infrastructure/SettingsStore";

@injectable()
export class SettingsProvider {

    constructor(private readonly settingsStore: SettingsStore) {
    }

    public getSettings(): Settings {
        return {
            presentation: {
                score: {
                    highThreshold: this.settingsStore.getOrSetDefault<number>("presentation.score.highThreshold", 0.05),
                    mediumThreshold: this.settingsStore.getOrSetDefault<number>("presentation.score.mediumThreshold", 0.0025)
                },
                visibility: {
                    lowScoreThreshold: this.settingsStore.getOrSetDefault<number>("presentation.visibility.lowScoreThreshold", 0.003),
                    visibleByDefaultNumber: this.settingsStore.getOrSetDefault<number>("presentation.visibility.visibleByDefaultNumber", 2)
                }
            }
        };
    }
}