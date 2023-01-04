import { Observable } from 'rxjs';

import { ViewNames } from '@selected-text-translate/common/views/view-names';
import { Messages } from '@selected-text-translate/common/messaging/messages';
import { SettingsGroup } from '@selected-text-translate/common/settings/settings-group';

import { mapSubject } from '~/utils/map-subject';
import { ViewContext } from '~/presentation/framework/ViewContext';

import { ViewBase } from './ViewBase';

export class SettingsView extends ViewBase {
  public readonly pauseHotkeys$: Observable<boolean>;
  public readonly setStartupState$: Observable<boolean>;
  public readonly openSettingsFile$: Observable<void>;
  public readonly resetSettings$: Observable<void>;

  constructor(viewContext: ViewContext) {
    super(ViewNames.Settings, viewContext, {
      iconName: 'tray',
      isFrameless: false,
      title: 'Settings',
      isScalingEnabled: mapSubject(
        viewContext.scalingSettings,
        scaling => !scaling.scaleTranslationViewOnly
      )
    });

    this.pauseHotkeys$ = this.messageBus.observeMessage<boolean>(
      Messages.Renderer.Settings.PauseHotkeysCommand
    );

    this.setStartupState$ = this.messageBus.observeMessage<boolean>(
      Messages.Renderer.Settings.SetStartupStateCommand
    );
    this.openSettingsFile$ = this.messageBus.observeMessage<void>(
      Messages.Renderer.Settings.OpenSettingsFileCommand
    );
    this.resetSettings$ = this.messageBus.observeMessage<void>(
      Messages.Renderer.Settings.ResetSettingsCommand
    );

    this.setupSettingsMessageHandlers();
  }

  public showSettingsGroup(settingsGroup: SettingsGroup): void {
    this.show();
    this.messageBus.sendMessage(Messages.Main.Settings.ShowGroupCommand, settingsGroup);
  }

  protected getInitialBounds(): Electron.Rectangle {
    const settingsViewSettings = this.context.viewsSettings.settings;
    return this.getCentralPosition(settingsViewSettings.width, settingsViewSettings.height);
  }

  private setupSettingsMessageHandlers(): void {
    this.messageBus.listenToMessage(Messages.Renderer.Settings.GetDefaultSettings, () =>
      this.context.settingsProvider.getDefaultSettings()
    );

    this.messageBus.listenToMessage(
      Messages.Renderer.Settings.GetStartupState,
      () => this.context.startupHandler.isStartupEnabled$.value
    );
    this.messageBus.registerObservable(
      Messages.Main.Settings.StartupStateChanged,
      this.context.startupHandler.isStartupEnabled$
    );
  }
}
