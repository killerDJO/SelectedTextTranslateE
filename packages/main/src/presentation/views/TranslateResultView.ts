import { Observable } from 'rxjs';

import { Messages } from '@selected-text-translate/common/messaging/messages';
import { ViewNames } from '@selected-text-translate/common/views/view-names';

import { ViewContext } from '~/presentation/framework/ViewContext';
import { ViewOptions } from '~/presentation/framework/ViewOptions';

import { ViewBase } from './ViewBase';

export abstract class TranslateResultView extends ViewBase {
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
