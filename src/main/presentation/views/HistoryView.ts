import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { Messages } from "common/messaging/Messages";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";
import { HistoryRecord } from "common/dto/history/HistoryRecord";

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

        this.historyRecordsRequest$ = this.messageBus.observeCommand<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords);
        this.archiveRecord$ = this.messageBus.observeCommand<ArchiveRequest>(Messages.History.ArchiveRecord);
    }

    public setHistoryRecords(historyRecords: HistoryRecordsResponse): void {
        this.messageBus.sendValue(Messages.History.HistoryRecords, historyRecords);
    }

    public subscribeToHistoryUpdate(historyUpdate$: Observable<HistoryRecord>): void {
        this.registerSubscription(historyUpdate$.subscribe(() => this.messageBus.sendNotification(Messages.History.HistoryUpdated)));
    }

    protected getInitialBounds(): Electron.Rectangle {
        const historySettings = this.context.viewsSettings.history;
        return this.getCentralPosition(historySettings.width, historySettings.height);
    }
}