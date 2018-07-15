import { Settings } from "business-logic/settings/dto/Settings";
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
                    historyRefreshInterval: this.settingsStore.getOrSetDefault<number>("engine.historyRefreshInterval", 30)
                },
                view: {
                    translation: {
                        width: this.settingsStore.getOrSetDefault<number>("view.translation.width", 300),
                        height: this.settingsStore.getOrSetDefault<number>("view.translation.height", 400),
                        margin: this.settingsStore.getOrSetDefault<number>("view.translation.margin", 5)
                    },
                    history: {
                        width: this.settingsStore.getOrSetDefault<number>("view.history.width", 70),
                        height: this.settingsStore.getOrSetDefault<number>("view.history.height", 55)
                    },
                    settings: {
                        width: this.settingsStore.getOrSetDefault<number>("view.settings.width", 70),
                        height: this.settingsStore.getOrSetDefault<number>("view.settings.height", 55)
                    },
                    scaling: {
                        autoScale: this.settingsStore.getOrSetDefault<boolean>("view.scaling.autoScale", true),
                        initialScaling: this.settingsStore.getOrSetDefault<number>("view.scaling.initialScaling", 1),
                        scalingStep: this.settingsStore.getOrSetDefault<number>("view.scaling.scalingStep", 0.05),
                        verticalResolutionBaseline: this.settingsStore.getOrSetDefault<number>("view.scaling.verticalResolutionBaseline", 860)
                    }
                },
                hotkeys: {
                    translate: this.settingsStore.getOrSetDefault<string[]>("hotkeys.translate", ["CommandOrControl+T"]),
                    playText: this.settingsStore.getOrSetDefault<string[]>("hotkeys.playText", ["CommandOrControl+R"]),
                    zoomIn: this.settingsStore.getOrSetDefault<string[]>("hotkeys.zoomIn", ["CommandOrControl+="]),
                    zoomOut: this.settingsStore.getOrSetDefault<string[]>("hotkeys.zoomOut", ["CommandOrControl+-"])
                }
            };
        }

        return this.cachedSettings;
    }
}