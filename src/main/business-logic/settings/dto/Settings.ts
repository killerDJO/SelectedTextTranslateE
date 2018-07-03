import { PresentationSettings } from "common/dto/presentation-settings/PresentationSettings";
import { TranslationEngineSettings } from "./TranslationEngineSettings";

export interface Settings {
    readonly presentation: PresentationSettings;
    readonly engine: TranslationEngineSettings;
}