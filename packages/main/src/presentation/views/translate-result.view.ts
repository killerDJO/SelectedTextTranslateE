import { Observable } from 'rxjs';

import { Messages, ViewNames } from '@selected-text-translate/common';

import { ViewContext } from '~/presentation/framework/view-context.service';
import { ViewOptions } from '~/presentation/framework/view-options.interface';

import { BaseView } from './base.view';

export abstract class TranslateResultView extends BaseView {
  public readonly playingStateChange$: Observable<boolean>;
  public readonly historyRecordChange$: Observable<string>;

  constructor(viewName: ViewNames, viewContext: ViewContext, viewOptions: ViewOptions) {
    super(viewName, viewContext, viewOptions);

    this.messageBus.listenToMessage(
      Messages.Renderer.Translation.ExecuteGoogleRequestCommand,
      (rpcId: string, data: string) =>
        this.context.requestProvider.executeGoogleTranslateRequest(rpcId, data)
    );

    this.playingStateChange$ = this.messageBus.observeMessage<boolean>(
      Messages.Renderer.Translation.PlayingStateChange
    );
    this.historyRecordChange$ = this.messageBus.observeMessage<string>(
      Messages.Renderer.Translation.HistoryRecordChange
    );
  }
}
