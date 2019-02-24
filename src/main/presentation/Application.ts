import { injectable } from "inversify";
import { concatMap, distinctUntilChanged } from "rxjs/operators";

import { TranslateResultViews } from "common/dto/translation/TranslateResultViews";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { TranslationRequest } from "common/dto/translation/TranslationRequest";
import { PlayTextRequest } from "common/dto/translation/PlayTextRequest";
import { ViewNames } from "common/ViewNames";
import { SettingsGroup } from "common/dto/settings/SettingsGroup";

import { Updater } from "install/Updater";
import { StartupHandler } from "install/StartupHandler";

import { NotificationSender } from "infrastructure/NotificationSender";

import { SearchExecutor } from "business-logic/search/SearchExecutor";
import { TextTranslator } from "business-logic/translation/TextTranslator";
import { TextExtractor } from "business-logic/translation/TextExtractor";
import { TextPlayer } from "business-logic/translation/TextPlayer";
import { HistoryStore } from "business-logic/history/HistoryStore";
import { HistorySyncService } from "business-logic/history/sync/HistorySyncService";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";
import { AccountHandler } from "business-logic/history/sync/AccountHandler";
import { TagsEngine } from "business-logic/history/TagsEngine";
import { HistoryQueryExecutor } from "business-logic/history/HistoryQueryExecutor";
import { HistoryMerger } from "business-logic/history/merging/HistoryMerger";

import { Taskbar } from "presentation/Taskbar";
import { TranslationView } from "presentation/views/TranslationView";
import { HotkeysRegistry } from "presentation/hotkeys/HotkeysRegistry";
import { IconsProvider } from "presentation/infrastructure/IconsProvider";
import { ViewsRegistry } from "presentation/views/ViewsRegistry";
import { ViewBase } from "presentation/framework/ViewBase";
import { HistoryView } from "presentation/views/HistoryView";
import { SettingsView } from "presentation/views/SettingsView";
import { Scaler } from "presentation/framework/scaling/Scaler";
import { TranslateResultView } from "presentation/views/TranslateResultView";
import { AboutView } from "presentation/views/AboutView";

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
        private readonly historyQueryExecutor: HistoryQueryExecutor,
        private readonly viewsRegistry: ViewsRegistry,
        private readonly updater: Updater,
        private readonly searchExecutor: SearchExecutor,
        private readonly startupHandler: StartupHandler,
        private readonly historySyncService: HistorySyncService,
        private readonly accountHandler: AccountHandler,
        private readonly tagsEngine: TagsEngine,
        private readonly historyMerger: HistoryMerger) {

        this.createTaskbar();
        this.setupHotkeys();
    }

    private setupTranslationView(translationView: TranslationView): void {
        this.setupTranslateResultView(translationView, false, historyRecord => {
            const historyView = this.viewsRegistry.getView<HistoryView>(ViewNames.History);
            if (historyView !== null) {
                historyView.updateTranslateResult(historyRecord);
            }
        });
        translationView.archive$.subscribe(() => translationView.hide());
    }

    private setupHistoryView(historyView: HistoryView): void {
        historyView.historyRecordsRequest$
            .pipe(concatMap(request => this.historyQueryExecutor.getRecords(request)))
            .subscribe(records => historyView.setHistoryRecords(records));
        historyView.archiveRecord$
            .pipe(concatMap(record => this.historyStore.setArchivedStatus(record, record.isArchived)))
            .subscribe(record => this.historyView.updateTranslateResult(record));

        historyView.subscribeToHistoryUpdate(this.historyStore.historyUpdated$);
        historyView.subscribeToHistoryUpdate(this.historySyncService.syncStateUpdated$);

        historyView.subscribeToHistorySyncState(this.historySyncService.isSyncInProgress$);
        historyView.subscribeToHistoryUser(this.accountHandler.currentUser$);
        historyView.handleSignIn(request => this.accountHandler.signInUser(request));
        historyView.handleSignUp(request => this.accountHandler.signUpUser(request));
        historyView.handleSendPasswordResetToken(request => this.accountHandler.sendPasswordResetToken(request));
        historyView.handlePasswordReset(request => this.accountHandler.resetPassword(request));
        historyView.handlePasswordChange(request => this.accountHandler.changePassword(request));
        historyView.handleVerifyPasswordResetToken(request => this.accountHandler.verifyPasswordResetToken(request));

        historyView.mergeRecords$.subscribe(request => this.historyMerger.mergeRecords(request).subscribe());
        historyView.blacklistRecords$.subscribe(request => this.historyMerger.blacklistRecords(request).subscribe());
        historyView.handleMergeCandidatesRequest(() => this.historyMerger.getMergeCandidates());

        historyView.signOut$.subscribe(() => this.accountHandler.signOutUser().subscribe());
        historyView.syncOneTime$.subscribe(() => this.historySyncService.startSingleSync(false));
        historyView.syncOneTimeForced$.subscribe(() => this.historySyncService.startSingleSync(true));
        historyView.showHistorySettings$.subscribe(() => this.settingsView.showSettingsGroup(SettingsGroup.History));

        historyView.updateCurrentTags$.subscribe(tags => this.tagsEngine.updateCurrentTags(tags));
        historyView.updateColumnSettings$.subscribe(columns => this.settingsProvider.updateSettings({ views: { history: { renderer: { columns: columns } } } }));
        historyView.setCurrentTags(this.tagsEngine.getCurrentTags());

        this.setupTranslateResultView(historyView, true);
    }

    private setupTranslateResultView(translateResultView: TranslateResultView, skipStatistic: boolean, updateRecordCallback?: (historyRecord: HistoryRecord) => void): void {
        translateResultView.playText$.subscribe(request => this.playText(request));
        translateResultView.translateText$.subscribe(request => this.translateText(request, skipStatistic, translateResultView));
        translateResultView.search$.subscribe(text => this.searchExecutor.search(text));
        translateResultView.archive$
            .pipe(concatMap(key => this.historyStore.setArchivedStatus(key, true)))
            .subscribe(record => this.historyView.updateTranslateResult(record));
        translateResultView.starTranslateResult$
            .pipe(concatMap(starRequest => this.historyStore.setStarredStatus(starRequest, starRequest.isStarred)))
            .subscribe(historyRecord => this.updateRecordAfterChange(translateResultView, historyRecord, updateRecordCallback));
        translateResultView.updateTags$
            .pipe(concatMap(updateTagsRequest => this.historyStore.updateTags(updateTagsRequest, updateTagsRequest.tags)))
            .subscribe(historyRecord => this.updateRecordAfterChange(translateResultView, historyRecord, updateRecordCallback));
        translateResultView.handleGetTagSuggestions(input => this.tagsEngine.getSuggestions(input));
    }

    private updateRecordAfterChange(translateResultView: TranslateResultView, historyRecord: HistoryRecord, updateRecordCallback?: (historyRecord: HistoryRecord) => void): void {
        translateResultView.updateTranslateResult(historyRecord);
        if (!!updateRecordCallback) {
            updateRecordCallback(historyRecord);
        }
    }

    private setupSettingsView(settingsView: SettingsView): void {
        settingsView.setSettings(this.settingsProvider.getSettings());
        settingsView.setDefaultSettings(this.settingsProvider.getDefaultSettings());
        settingsView.setScalingState(this.scaler.scalingState);
        settingsView.setScaleFactor$.subscribe(scaleFactor => this.scaler.setScaleFactor(scaleFactor));
        settingsView.setStartupState(this.startupHandler.isStartupEnabled$);
        settingsView.setStartupState$
            .subscribe(state => state ? this.startupHandler.enableStartup() : this.startupHandler.disableStartup());
        settingsView.pauseHotkeys$
            .pipe(distinctUntilChanged())
            .subscribe(arePaused => arePaused ? this.hotkeysRegistry.pauseHotkeys() : this.hotkeysRegistry.resumeHotkeys());
        settingsView.updatedSettings$.subscribe(updatedSettings => this.settingsProvider.updateSettings(updatedSettings));
        settingsView.openSettingsFile$.subscribe(() => this.settingsProvider.openInEditor());
    }

    private setupAboutView(aboutView: AboutView): void {
        aboutView.checkForUpdates$.subscribe(() => this.updater.checkForUpdate());
    }

    private setupHotkeys(): void {
        this.hotkeysRegistry.registerHotkeys();
        this.hotkeysRegistry.translate$.subscribe(() => this.translateSelectedText());
        this.hotkeysRegistry.showDefinition$.subscribe(() => this.translateSelectedText(TranslateResultViews.Definition));
        this.hotkeysRegistry.playText$
            .pipe(concatMap(() => this.textExtractor.getSelectedText()))
            .subscribe(text => this.playText({ text }));
        this.hotkeysRegistry.inputText$.subscribe(() => this.translationView.showTextInput());
        this.hotkeysRegistry.areHotkeysSuspended$.subscribe(areHotkeysSuspended => areHotkeysSuspended ? this.taskbar.suspend() : this.taskbar.resume());
    }

    private createTaskbar(): void {
        this.taskbar = new Taskbar(this.iconsProvider, this.tagsEngine);

        this.taskbar.translateSelectedText$.subscribe(() => this.translateSelectedText());
        this.taskbar.showSettings$.subscribe(() => this.settingsView.show());
        this.taskbar.showHistory$.subscribe(() => this.historyView.show());
        this.taskbar.isSuspended$
            .pipe(distinctUntilChanged())
            .subscribe(areSuspended => areSuspended ? this.hotkeysRegistry.suspendHotkeys() : this.hotkeysRegistry.enableHotkeys());
        this.taskbar.watchPlayingState(this.textPlayer.isPlayInProgress$);
        this.taskbar.showAbout$.subscribe(() => this.aboutView.show());
    }

    private translateSelectedText(defaultView: TranslateResultViews = TranslateResultViews.Translation): void {
        this.textExtractor.getSelectedText()
            .subscribe(text => this.translateText({ text, isForcedTranslation: false, refreshCache: false }, false, this.translationView, defaultView));
    }

    private playText(request: PlayTextRequest): void {
        this.textPlayer
            .playText(request)
            .subscribe({
                error: error => this.notificationSender.showNonCriticalError("Error playing text", error)
            });
    }

    private translateText(translationRequest: TranslationRequest, skipStatistic: boolean, targetView: TranslateResultView, defaultTranslateResultView: TranslateResultViews = TranslateResultViews.Translation): void {
        if (this.viewsRegistry.exists(ViewNames.Translation)) {
            skipStatistic = skipStatistic || this.translationView.isTranslationVisible(translationRequest);
        }

        targetView.showProgressIndicator();
        this.textTranslator
            .translate(translationRequest, skipStatistic)
            .subscribe(
                result => {
                    targetView.setTranslateResult(result, defaultTranslateResultView);
                    if (result !== null && targetView === this.translationView && this.viewsRegistry.exists(ViewNames.History)) {
                        this.historyView.updateTranslateResult(result);
                    }
                },
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

    private get aboutView(): AboutView {
        return this.createView(ViewNames.About, view => this.setupAboutView(view));
    }
}