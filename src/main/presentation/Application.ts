import { injectable } from "inversify";
import { concatMap, distinctUntilChanged } from "rxjs/operators";

import { Taskbar } from "presentation/Taskbar";
import { TranslationView } from "presentation/views/TranslationView";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextPlayer } from "business-logic/translation/TextPlayer";
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
import { Updater } from "install/Updater";
import { NotificationSender } from "infrastructure/NotificationSender";

import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { TranslationViewBase } from "presentation/views/TranslationViewBase";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

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
        private readonly notificationSender: NotificationSender,
        private readonly historyStore: HistoryStore,
        private readonly viewsRegistry: ViewsRegistry,
        private readonly updater: Updater) {

        this.createTaskbar();
        this.setupHotkeys();
    }

    private setupTranslationView(translationView: TranslationViewBase): void {
        this.setupTranslationViewBase(translationView, false, historyRecord => {
            const historyView = this.viewsRegistry.getView<HistoryView>(ViewNames.History);
            if (historyView !== null) {
                historyView.updateTranslateResult(historyRecord);
            }
        });
    }

    private setupHistoryView(historyView: HistoryView): void {
        historyView.historyRecordsRequest$
            .pipe(concatMap(request => this.historyStore.getRecords(request.pageNumber, request.sortColumn, request.sortOrder, request.starredOnly)))
            .subscribe(records => historyView.setHistoryRecords(records));

        historyView.subscribeToHistoryUpdate(this.historyStore.historyUpdated$);

        this.setupTranslationViewBase(historyView, true);
    }

    private setupTranslationViewBase(translationViewBase: TranslationViewBase, skipStatistic: boolean, starCallback?: (historyRecord: HistoryRecord) => void): void {
        translationViewBase.playText$.subscribe(text => this.playText(text));
        translationViewBase.translateText$.subscribe(text => this.translateText(text, false, skipStatistic, translationViewBase));
        translationViewBase.forceTranslateText$.subscribe(text => this.translateText(text, true, skipStatistic, translationViewBase));
        translationViewBase.starTranslateResult$
            .pipe(concatMap(starRequest => this.historyStore.setStarredStatus(starRequest.sentence, starRequest.isForcedTranslation, starRequest.isStarred)))
            .subscribe(historyRecord => {
                translationViewBase.updateTranslateResult(historyRecord);
                if (!!starCallback) {
                    starCallback(historyRecord);
                }
            });
    }

    private setupSettingsView(settingsView: SettingsView): void {
        settingsView.setSettings(this.settingsProvider.getSettings());
        settingsView.setDefaultSettings(this.settingsProvider.getDefaultSettings());
        settingsView.setScalingState(this.scaler.scalingState);
        settingsView.setScaleFactor$.subscribe(scaleFactor => this.scaler.setScaleFactor(scaleFactor));
        settingsView.pauseHotkeys$
            .pipe(distinctUntilChanged())
            .subscribe(arePaused => arePaused ? this.hotkeysRegistry.pauseHotkeys() : this.hotkeysRegistry.resumeHotkeys());
        settingsView.updatedSettings$.subscribe(updatedSettings => this.settingsProvider.updateSettings(updatedSettings));
        settingsView.openSettingsFile$.subscribe(() => this.settingsProvider.openInEditor());
    }

    private setupHotkeys(): void {
        this.hotkeysRegistry.registerHotkeys();
        this.hotkeysRegistry.translate$.subscribe(() => this.translateSelectedText());
        this.hotkeysRegistry.showDefinition$.subscribe(() => this.translateSelectedText(TranslateResultViews.Definition));
        this.hotkeysRegistry.playText$
            .pipe(concatMap(() => this.textExtractor.getSelectedText()))
            .subscribe(text => this.playText(text));
        this.hotkeysRegistry.inputText$.subscribe(() => this.translationView.showTextInput());
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar(this.iconsProvider);

        this.taskbar.translateSelectedText$.subscribe(() => this.translateSelectedText());
        this.taskbar.showSettings$.subscribe(() => this.settingsView.show());
        this.taskbar.showHistory$.subscribe(() => this.historyView.show());
        this.taskbar.isSuspended$
            .pipe(distinctUntilChanged())
            .subscribe(areSuspended => areSuspended ? this.hotkeysRegistry.suspendHotkeys() : this.hotkeysRegistry.enableHotkeys());
        this.taskbar.checkForUpdates$.subscribe(() => this.updater.checkForUpdate());
    }

    private translateSelectedText(defaultView: TranslateResultViews = TranslateResultViews.Translation): void {
        this.textExtractor
            .getSelectedText()
            .subscribe(text => this.translateText(text, false, false, this.translationView, defaultView));
    }

    private playText(text: string): void {
        this.textPlayer
            .playText(text)
            .subscribe({
                error: error => this.notificationSender.showNonCriticalError("Error playing text", error)
            });
    }

    private translateText(text: string, isForcedTranslation: boolean, skipStatistic: boolean, targetView: TranslationViewBase, defaultTranslateResultView: TranslateResultViews = TranslateResultViews.Translation): void {
        targetView.showProgressIndicator();
        this.textTranslator
            .translate(text, isForcedTranslation, skipStatistic)
            .subscribe(
                result => targetView.setTranslateResult(result, defaultTranslateResultView),
                error => {
                    this.notificationSender.showNonCriticalError("Error translating text", error);
                    targetView.hide();
                }
            );
    }

    private createView<TView extends ViewBase>(viewName: ViewNames, postCreateAction?: (view: TView) => void): TView {
        return this.viewsRegistry.getOrCreateView<TView>(viewName, postCreateAction);
    }

    private get translationView(): TranslationView {
        return this.createView<TranslationView>(ViewNames.Translation, view => this.setupTranslationView(view));
    }

    private get historyView(): HistoryView {
        return this.createView(ViewNames.History, view => this.setupHistoryView(view));
    }

    private get settingsView(): SettingsView {
        return this.createView(ViewNames.Settings, view => this.setupSettingsView(view));
    }
}