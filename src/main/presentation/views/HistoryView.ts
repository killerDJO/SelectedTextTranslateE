import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { Messages } from "common/messaging/Messages";
import { mapSubject } from "utils/map-subject";

export class HistoryView extends ViewBase {

    public historyRecordsRequest$!: Observable<HistoryRecordsRequest>;
    public translateText$!: Observable<string>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.History, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "History",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        this.historyRecordsRequest$ = this.messageBus.getValue<HistoryRecordsRequest>(Messages.RequestHistoryRecords);
        this.translateText$ = this.messageBus.getValue<string>(Messages.TranslateCommand);
    }

    public setHistoryRecords(historyRecords: HistoryRecord[]): void {
        this.messageBus.sendValue(Messages.HistoryRecords, historyRecords);
    }

    public subscribeToHistoryUpdate(historyUpdate$: Observable<void>): void {
        this.registerSubscription(historyUpdate$.subscribe(() => this.messageBus.sendNotification(Messages.HistoryUpdated)));
    }

    protected getInitialBounds(): Electron.Rectangle {
        const historySettings = this.context.viewsSettings.history;
        return this.getCentralPosition(historySettings.width, historySettings.height);
    }
}