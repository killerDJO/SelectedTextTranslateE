import { Observable } from 'rxjs';

import { Messages, ViewNames } from '@selected-text-translate/common';

import { ViewContext } from '~/presentation/framework/view-context.service';
import { mapSubject } from '~/utils/observable.utils';

import { TranslateResultView } from './translate-result.view';

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
