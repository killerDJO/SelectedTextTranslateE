import { RendererSettings } from "common/dto/settings/renderer-settings/RendererSettings";
import { Hotkey } from "common/dto/settings/Hotkey";
import { FirebaseSettings } from "common/dto/settings/FirebaseSettings";
import { HistorySyncSettings } from "common/dto/settings/HistorySyncSettings";
import { TranslateResultRendererSettings } from "common/dto/settings/views-settings/TranslationResultViewSettings";
import { HistoryViewRendererSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { LanguageSettings } from "common/dto/settings/LanguageSettings";
import { Tag } from "common/dto/history/Tag";

export interface Settings {
    readonly renderer: RendererSettings;
    readonly engine: TranslationEngineSettings;
    readonly history: HistorySettings;
    readonly views: ViewsSettings;
    readonly scaling: ScalingSettings;
    readonly hotkeys: HotkeySettings;
    readonly update: UpdateSettings;
    readonly language: LanguageSettings;
    readonly search: SearchSettings;
    readonly firebase: FirebaseSettings;
    readonly tags: TagSettings;
}

export interface HotkeySettings {
    readonly translate: Hotkey[];
    readonly showDefinition: Hotkey[];
    readonly playText: Hotkey[];
    readonly inputText: Hotkey[];
    readonly toggleSuspend: Hotkey[];
}

export interface TranslationEngineSettings {
    readonly copyDelayMilliseconds: number;
    readonly historyRefreshInterval: number;
    readonly userAgent: string;
    readonly requestTimeout: number;
    readonly translationConfigRefreshInterval: number;
    readonly proxy: ProxySettings;
    readonly playVolume: number;
    readonly enableRequestsLogging: boolean;
}

export interface ProxySettings {
    readonly isEnabled: string;
    readonly url: string;
}

export interface ViewsSettings {
    readonly translation: TranslationViewSettings;
    readonly settings: ViewSize;
    readonly about: ViewSize;
    readonly history: HistoryViewSettings;
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
    readonly x?: number;
    readonly y?: number;
    readonly renderer: TranslateResultRendererSettings;
}

export interface HistoryViewSettings extends ViewSize {
    readonly renderer: HistoryViewRendererSettings;
}

export interface HistorySettings extends ViewSize {
    readonly sync: HistorySyncSettings;
}

export interface UpdateSettings {
    readonly feedUrl: string;
    readonly releasesUrl: string;
}

export interface SearchSettings {
    readonly searchPattern: string;
}

export interface TagSettings {
    readonly currentTags: ReadonlyArray<string | Tag>;
}