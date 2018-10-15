import { Observable } from "rxjs";

import { ViewNames } from "common/ViewNames";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { Messages } from "common/messaging/Messages";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { AccountInfo } from "common/dto/history/account/AccountInfo";

import { mapSubject } from "utils/map-subject";

import { ViewContext } from "presentation/framework/ViewContext";
import { TranslateResultView } from "presentation/views/TranslateResultView";
import { SignInRequest } from "common/dto/history/account/SignInRequest";
import { SignInResponse } from "common/dto/history/account/SignInResponse";

export class HistoryView extends TranslateResultView {

    public readonly historyRecordsRequest$!: Observable<HistoryRecordsRequest>;
    public readonly archiveRecord$: Observable<ArchiveRequest>;

    public readonly signOut$: Observable<void>;
    public readonly syncOneTime$: Observable<void>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.History, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "History",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        this.historyRecordsRequest$ = this.messageBus.observeCommand<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords);
        this.archiveRecord$ = this.messageBus.observeCommand<ArchiveRequest>(Messages.History.ArchiveRecord);

        this.signOut$ = this.messageBus.observeCommand<void>(Messages.History.SignOut);
        this.syncOneTime$ = this.messageBus.observeCommand<void>(Messages.History.SyncOneTime);
    }

    public setHistoryRecords(historyRecords: HistoryRecordsResponse): void {
        this.messageBus.sendValue(Messages.History.HistoryRecords, historyRecords);
    }

    public handleSignIn(handler: (signInRequest: SignInRequest) => Observable<SignInResponse>): void {
        this.messageBus.handleCommand<SignInRequest, SignInResponse>(Messages.History.SignIn, handler);
    }

    public handleSignUp(handler: (signInRequest: SignInRequest) => Observable<SignInResponse>): void {
        this.messageBus.handleCommand<SignInRequest, SignInResponse>(Messages.History.SignUp, handler);
    }

    public subscribeToHistoryUpdate(historyUpdate$: Observable<HistoryRecord>): void {
        this.registerSubscription(historyUpdate$.subscribe(() => this.messageBus.sendNotification(Messages.History.HistoryUpdated)));
    }

    public subscribeToHistorySyncState(isSyncInProgress$: Observable<boolean>): void {
        this.registerSubscription(this.messageBus.registerObservable(Messages.History.SyncState, isSyncInProgress$).subscription);
    }

    public subscribeToHistoryUser(historyUser$: Observable<AccountInfo | null>): void {
        this.registerSubscription(this.messageBus.registerObservable(Messages.History.CurrentUser, historyUser$).subscription);
    }

    protected getInitialBounds(): Electron.Rectangle {
        const historySettings = this.context.viewsSettings.history;
        return this.getCentralPosition(historySettings.width, historySettings.height);
    }
}