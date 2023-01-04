import { Observable } from 'rxjs';

import { Messages } from '@selected-text-translate/common/messaging/messages';
import { ViewNames } from '@selected-text-translate/common/views/view-names';

import { ViewContext } from '~/presentation/framework/ViewContext';
import { mapSubject } from '~/utils/map-subject';

import { TranslateResultView } from './TranslateResultView';

export class HistoryView extends TranslateResultView {
  public readonly showHistorySettings$: Observable<void>;

  constructor(viewContext: ViewContext) {
    super(ViewNames.History, viewContext, {
      iconName: 'tray',
      isFrameless: false,
      title: 'History',
      isScalingEnabled: mapSubject(
        viewContext.scalingSettings,
        scaling => !scaling.scaleTranslationViewOnly
      )
    });

    this.showHistorySettings$ = this.messageBus.observeMessage<void>(
      Messages.Renderer.History.ShowHistorySettingsCommand
    );
  }

  public notifyOnHistoryRecordChange(id: string): void {
    this.messageBus.sendMessage(Messages.Main.History.HistoryRecordChanged, id);
  }

  protected getInitialBounds(): Electron.Rectangle {
    const historySettings = this.context.viewsSettings.history;
    return this.getCentralPosition(historySettings.width, historySettings.height);
  }
}
