import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { Messages } from "common/messaging/Messages";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";

import { mapSubject } from "utils/map-subject";

import { ViewContext } from "presentation/framework/ViewContext";
import { TranslateResultView } from "presentation/views/TranslateResultView";

export class HistoryView extends TranslateResultView {

    public historyRecordsRequest$!: Observable<HistoryRecordsRequest>;
    public readonly archiveRecord$: Observable<ArchiveRequest>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.History, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "History",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        this.historyRecordsRequest$ = this.messageBus.observeValue<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords);
        this.archiveRecord$ = this.messageBus.observeValue<ArchiveRequest>(Messages.History.ArchiveRecord);
    }

    public setHistoryRecords(historyRecords: HistoryRecordsResponse): void {
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