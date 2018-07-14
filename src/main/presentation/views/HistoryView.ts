import { ViewNames } from "common/ViewNames";
import { ViewBase } from "presentation/framework/ViewBase";
import { ViewContext } from "presentation/framework/ViewContext";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { Messages } from "common/messaging/Messages";

export class HistoryView extends ViewBase {
    constructor(viewContext: ViewContext) {
        super(ViewNames.History, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "History"
        });
    }

    public setHistoryRecords(historyRecords: HistoryRecord[]): void {
        this.messageBus.sendValue(Messages.HistoryRecords, historyRecords);
    }

    protected getInitialBounds(): Electron.Rectangle {
        const historySettings = this.context.settingsProvider.getSettings().view.history;
        return this.getCentralPosition(historySettings.width, historySettings.height);
    }
}