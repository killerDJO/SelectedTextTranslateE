import { injectable } from "inversify";

import { Taskbar } from "presentation/Taskbar";
import { TranslationView } from "presentation/views/TranslationView";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextPlayer } from "business-logic/translation/TextPlayer";
import { StorageFolderProvider } from "infrastructure/StorageFolderProvider";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewsRegistry } from "presentation/views/ViewsRegistry";
import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { HistoryView } from "presentation/views/HistoryView";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { SettingsView } from "presentation/views/SettingsView";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { Scaler } from "presentation/framework/scaling/Scaler";
import { settings } from "cluster";

@injectable()
export class Application {
    private taskbar!: Taskbar;

    constructor(
        private readonly textTranslator: TextTranslator,
        private readonly textPlayer: TextPlayer,
        private readonly scaler: Scaler,
        private readonly hotkeysRegistry: HotkeysRegistry,
        private readonly iconsProvider: IconsProvider,
        private readonly textExtractor: TextExtractor,
        private readonly settingsProvider: SettingsProvider,
        private readonly historyStore: HistoryStore,
        private readonly viewsRegistry: ViewsRegistry,
        private readonly storageFolderProvider: StorageFolderProvider) {

        this.createTaskbar();
        this.setupHotkeys();
    }

    private setupTranslationView(translationView: TranslationView): void {
        translationView.playText$.subscribe(text => this.textPlayer.playText(text));
        translationView.translateText$.subscribe(text => this.translateText(text, false));
        translationView.forceTranslateText$.subscribe(text => this.translateText(text, true));
    }

    private setupHistoryView(historyView: HistoryView): void {
        historyView.historyRecordsRequest$
            .concatMap(request => this.historyStore.getRecords(request.limit, request.sortColumn, request.sortOrder))
            .subscribe(records => historyView.setHistoryRecords(records));
        historyView.subscribeToHistoryUpdate(this.historyStore.historyUpdated$);
        historyView.translateText$
            .subscribe(text => this.translateText(text, false));
    }

    private setupSettingsView(settingsView: SettingsView): void {
        settingsView.setSettings(this.settingsProvider.getSettings());
        settingsView.setDefaultSettings(this.settingsProvider.getDefaultSettings());
        settingsView.setScalingState(this.scaler.scalingState);
        settingsView.setScaleFactor$.subscribe(scaleFactor => this.scaler.setScaleFactor(scaleFactor));
        settingsView.pauseHotkeys$.subscribe(arePaused => arePaused ? this.hotkeysRegistry.pauseHotkeys() : this.hotkeysRegistry.resumeHotkeys());
        settingsView.updatedSettings$.subscribe(updatedSettings => this.settingsProvider.updateSettings(updatedSettings));
    }

    private setupHotkeys(): void {
        this.hotkeysRegistry.registerHotkeys();
        this.hotkeysRegistry.translate$
            .concatMap(() => this.textExtractor.getSelectedText())
            .subscribe(text => this.translateText(text, false));
        this.hotkeysRegistry.playText$
            .concatMap(() => this.textExtractor.getSelectedText())
            .subscribe(text => this.textPlayer.playText(text));
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar(this.storageFolderProvider, this.iconsProvider);

        this.taskbar.showTranslation$.subscribe(() => this.translationView.show());
        this.taskbar.showSettings$.subscribe(() => this.settingsView.show());
        this.taskbar.showHistory$.subscribe(() => this.historyView.show());
    }

    private translateText(text: string, isForcedTranslation: boolean): void {
        this.textTranslator.translate(text, isForcedTranslation).subscribe(result => {
            this.translationView.show();
            this.translationView.setTranslateResult(result);
        });
    }

    private createView<TView extends ViewBase>(viewName: ViewNames, postCreateAction?: (view: TView) => void): TView {
        return this.viewsRegistry.getOrCreateView<TView>(viewName, postCreateAction);
    }

    private get translationView(): TranslationView {
        return this.createView<TranslationView>(ViewNames.TranslationResult, this.setupTranslationView.bind(this));
    }

    private get historyView(): HistoryView {
        return this.createView(ViewNames.History, this.setupHistoryView.bind(this));
    }

    private get settingsView(): SettingsView {
        return this.createView(ViewNames.Settings, this.setupSettingsView.bind(this));
    }
}