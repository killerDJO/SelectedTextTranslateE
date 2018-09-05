import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { ViewContext } from "presentation/framework/ViewContext";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { StarCommand } from "common/dto/translation/StarCommand";
import { Messages } from "common/messaging/Messages";
import { mapSubject } from "utils/map-subject";
import { TranslationViewBase } from "presentation/views/TranslationViewBase";

export class HistoryView extends TranslationViewBase {

    public historyRecordsRequest$!: Observable<HistoryRecordsRequest>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.History, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "History",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        this.historyRecordsRequest$ = this.messageBus.getValue<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords);
    }

    public setHistoryRecords(historyRecords: HistoryRecord[]): void {
        this.messageBus.sendValue(Messages.History.HistoryRecords, historyRecords);
    }

    public subscribeToHistoryUpdate(historyUpdate$: Observable<void>): void {
        this.registerSubscription(historyUpdate$.subscribe(() => this.messageBus.sendNotification(Messages.History.HistoryUpdated)));
    }

    protected getInitialBounds(): Electron.Rectangle {
        const historySettings = this.context.viewsSettings.history;
        return this.getCentralPosition(historySettings.width, historySettings.height);
    }
}