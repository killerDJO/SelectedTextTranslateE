import { injectable } from 'inversify';
import { concatMap, distinctUntilChanged } from 'rxjs/operators';

import { ViewNames } from '@selected-text-translate/common/views/view-names';
import { SettingsGroup } from '@selected-text-translate/common/settings/settings-group';

import { Taskbar } from '~/presentation/Taskbar';
import { TranslationView } from '~/presentation/views/TranslationView';
import { HotkeysRegistry } from '~/presentation/hotkeys/HotkeysRegistry';
import { IconsProvider } from '~/presentation/framework/IconsProvider';
import { ViewsRegistry } from '~/presentation/views/ViewsRegistry';
import { ViewBase } from '~/presentation/views/ViewBase';
import { HistoryView } from '~/presentation/views/HistoryView';
import { SettingsView } from '~/presentation/views/SettingsView';
import { AboutView } from '~/presentation/views/AboutView';
import { TextExtractor } from '~/services/TextExtractor';
import { SettingsProvider } from '~/infrastructure/SettingsProvider';
import { StartupHandler } from '~/install/StartupHandler';
import { Updater } from '~/install/Updater';

import { TranslateResultView } from './views/TranslateResultView';

@injectable()
export class Application {
  private taskbar!: Taskbar;

  constructor(
    private readonly hotkeysRegistry: HotkeysRegistry,
    private readonly iconsProvider: IconsProvider,
    private readonly textExtractor: TextExtractor,
    private readonly settingsProvider: SettingsProvider,
    private readonly viewsRegistry: ViewsRegistry,
    private readonly updater: Updater,
    private readonly startupHandler: StartupHandler
  ) {
    this.createTaskbar();
    this.setupHotkeys();
  }

  private setupTranslationView(translationView: TranslationView): void {
    this.setupTranslateResultView(translationView);
    translationView.historyRecordChange$.subscribe(id =>
      this.historyView.notifyOnHistoryRecordChange(id)
    );
  }

  private setupHistoryView(historyView: HistoryView): void {
    this.setupTranslateResultView(historyView);
    historyView.showHistorySettings$.subscribe(() => {
      this.settingsView.showSettingsGroup(SettingsGroup.History);
    });
    historyView.historyRecordChange$.subscribe(id => historyView.notifyOnHistoryRecordChange(id));
  }

  private setupTranslateResultView(translateResultView: TranslateResultView): void {
    this.taskbar.watchPlayingState(translateResultView.playingStateChange$);
  }

  private setupSettingsView(settingsView: SettingsView): void {
    settingsView.setStartupState$.subscribe(state =>
      state ? this.startupHandler.enableStartup() : this.startupHandler.disableStartup()
    );
    settingsView.pauseHotkeys$
      .pipe(distinctUntilChanged())
      .subscribe(arePaused =>
        arePaused ? this.hotkeysRegistry.pauseHotkeys() : this.hotkeysRegistry.resumeHotkeys()
      );
    settingsView.openSettingsFile$.subscribe(() => this.settingsProvider.openInEditor());
    settingsView.resetSettings$.subscribe(() => this.settingsProvider.resetSettings());
  }

  private setupAboutView(aboutView: AboutView): void {
    aboutView.checkForUpdates$.subscribe(() => this.updater.checkForUpdate());
  }

  private setupHotkeys(): void {
    this.hotkeysRegistry.registerHotkeys();
    this.hotkeysRegistry.translate$.subscribe(() => this.translateSelectedText());
    this.hotkeysRegistry.showDefinition$.subscribe(() => this.translateSelectedText(true));
    this.hotkeysRegistry.playText$
      .pipe(concatMap(() => this.textExtractor.getSelectedText()))
      .subscribe(text => this.translationView.playText(text));
    this.hotkeysRegistry.inputText$.subscribe(() => this.translationView.showTextInput());
    this.hotkeysRegistry.areHotkeysSuspended$.subscribe(areHotkeysSuspended =>
      areHotkeysSuspended ? this.taskbar.suspend() : this.taskbar.resume()
    );
  }

  private createTaskbar(): void {
    this.taskbar = new Taskbar(this.iconsProvider, this.settingsProvider);

    this.taskbar.translateSelectedText$.subscribe(() => this.translateSelectedText());
    this.taskbar.showSettings$.subscribe(() => this.settingsView.show());
    this.taskbar.showHistory$.subscribe(() => this.historyView.show());
    this.taskbar.isSuspended$
      .pipe(distinctUntilChanged())
      .subscribe(areSuspended =>
        areSuspended ? this.hotkeysRegistry.suspendHotkeys() : this.hotkeysRegistry.enableHotkeys()
      );
    this.taskbar.showAbout$.subscribe(() => this.aboutView.show());
  }

  private translateSelectedText(showDefinitions = false): void {
    this.textExtractor
      .getSelectedText()
      .subscribe(text => this.translationView.translateText(text, showDefinitions));
  }

  private createView<TView extends ViewBase>(
    viewName: ViewNames,
    postCreateAction?: (view: TView) => void
  ): TView {
    const view = this.viewsRegistry.getOrCreateView<TView>(viewName, view => {
      view.updateSettings$.subscribe(settings => this.settingsProvider.updateSettings(settings));
      postCreateAction?.(view);
    });

    return view;
  }

  private get translationView(): TranslationView {
    return this.createView<TranslationView>(ViewNames.Translation, view =>
      this.setupTranslationView(view)
    );
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
