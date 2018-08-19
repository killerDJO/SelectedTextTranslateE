import { RendererSettings } from "common/dto/settings/renderer-settings/RendererSettings";
import { Hotkey } from "common/dto/settings/Hotkey";
import { TranslationResultViewSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";

export interface Settings {
    readonly renderer: RendererSettings;
    readonly engine: TranslationEngineSettings;
    readonly views: ViewsSettings;
    readonly scaling: ScalingSettings;
    readonly hotkeys: HotkeySettings;
    readonly update: UpdateSettings;
}

export interface HotkeySettings {
    readonly translate: Hotkey[];
    readonly showDefinition: Hotkey[];
    readonly playText: Hotkey[];
}

export interface TranslationEngineSettings {
    readonly copyDelayMilliseconds: number;
    readonly baseUrl: string;
    readonly historyRefreshInterval: number;
    readonly userAgent: string;
    readonly requestTimeout: number;
}

export interface ViewsSettings {
    readonly translation: TranslationViewSettings;
    readonly settings: ViewSize;
    readonly history: ViewSize;
    readonly engine: ViewsEngineSettings;
}

export interface ViewsEngineSettings {
    readonly showDelayMilliseconds: number;
}

export interface ViewSize {
    readonly width: number;
    readonly height: number;
}

export interface ScalingSettings {
    readonly verticalResolutionBaseline: number;
    readonly scalingStep: number;
    readonly minScaling: number;
    readonly maxScaling: number;
    readonly scaleTranslationViewOnly: boolean;
    readonly scaleFactor: number;
}

export interface TranslationViewSettings extends ViewSize {
    readonly margin: number;
    readonly loadingDelay: number;
    readonly renderer: TranslationResultViewSettings;
}

export interface UpdateSettings {
    readonly feedUrl: string;
    readonly releasesUrl: string;
}