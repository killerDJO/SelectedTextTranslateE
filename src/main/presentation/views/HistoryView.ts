import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { ViewNames } from "common/ViewNames";
import { HistoryRecordsRequest } from "common/dto/history/HistoryRecordsRequest";
import { Messages } from "common/messaging/Messages";
import { HistoryRecordsResponse } from "common/dto/history/HistoryRecordsResponse";
import { ArchiveRequest } from "common/dto/history/ArchiveRequest";
import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";
import { PasswordChangeRequest } from "common/dto/history/account/PasswordChangeRequest";
import { PasswordChangeResponse } from "common/dto/history/account/PasswordChangeResponse";
import { HistoryViewRendererSettings, ColumnSettings } from "common/dto/settings/views-settings/HistoryViewSettings";
import { MergeCandidate } from "common/dto/history/MergeCandidate";
import { MergeRecordsRequest } from "common/dto/history/MergeRecordsRequest";
import { BlacklistRecordsRequest } from "common/dto/history/BlacklistRecordsRequest";
import { Tag } from "common/dto/history/Tag";

import { mapSubject } from "utils/map-subject";

import { ViewContext } from "presentation/framework/ViewContext";
import { TranslateResultView } from "presentation/views/TranslateResultView";

export class HistoryView extends TranslateResultView {

    public readonly historyRecordsRequest$!: Observable<HistoryRecordsRequest>;
    public readonly archiveRecord$: Observable<ArchiveRequest>;
    public readonly updateCurrentTags$: Observable<ReadonlyArray<Tag>>;
    public readonly mergeRecords$: Observable<MergeRecordsRequest>;
    public readonly blacklistRecords$: Observable<BlacklistRecordsRequest>;
    public readonly updateColumnSettings$: Observable<ReadonlyArray<ColumnSettings>>;

    public readonly signOut$: Observable<void>;
    public readonly showHistorySettings$: Observable<void>;
    public readonly syncOneTime$: Observable<void>;
    public readonly syncOneTimeForced$: Observable<void>;

    constructor(viewContext: ViewContext) {
        super(ViewNames.History, viewContext, {
            iconName: "tray",
            isFrameless: false,
            title: "History",
            isScalingEnabled: mapSubject(viewContext.scalingSettings, scaling => !scaling.scaleTranslationViewOnly)
        });

        const historySettings$ = this.context.settingsProvider.getSettings().pipe(map(settings => settings.views.history.renderer));
        this.registerSubscription(this.messageBus.registerObservable<HistoryViewRendererSettings>(Messages.History.HistorySettings, historySettings$).subscription);

        this.historyRecordsRequest$ = this.messageBus.observeCommand<HistoryRecordsRequest>(Messages.History.RequestHistoryRecords);
        this.archiveRecord$ = this.messageBus.observeCommand<ArchiveRequest>(Messages.History.ArchiveRecord);

        this.signOut$ = this.messageBus.observeCommand<void>(Messages.History.SignOut);
        this.showHistorySettings$ = this.messageBus.observeCommand<void>(Messages.History.ShowHistorySettings);
        this.syncOneTime$ = this.messageBus.observeCommand<void>(Messages.History.SyncOneTime);
        this.syncOneTimeForced$ = this.messageBus.observeCommand<void>(Messages.History.SyncOneTimeForced);

        this.updateCurrentTags$ = this.messageBus.observeCommand<ReadonlyArray<Tag>>(Messages.History.UpdateCurrentTags);
        this.updateColumnSettings$ = this.messageBus.observeCommand<ReadonlyArray<ColumnSettings>>(Messages.History.UpdateColumnSettings);

        this.mergeRecords$ = this.messageBus.observeCommand<MergeRecordsRequest>(Messages.History.Merging.MergeRequest);
        this.blacklistRecords$ = this.messageBus.observeCommand<BlacklistRecordsRequest>(Messages.History.Merging.BlacklistRequest);
    }

    public setHistoryRecords(historyRecords: HistoryRecordsResponse): void {
        this.messageBus.sendValue(Messages.History.HistoryRecords, historyRecords);
    }

    public setCurrentTags(tags: Observable<ReadonlyArray<Tag>>): void {
        this.registerSubscription(this.messageBus.registerObservable<ReadonlyArray<Tag>>(Messages.History.CurrentTags, tags).subscription);
    }

    public handleSignIn(handler: (signRequest: SignRequest) => Observable<SignInResponse>): void {
        this.messageBus.handleCommand<SignRequest, SignInResponse>(Messages.History.SignIn, handler);
    }

    public handleSignUp(handler: (signRequest: SignRequest) => Observable<SignUpResponse>): void {
        this.messageBus.handleCommand<SignRequest, SignUpResponse>(Messages.History.SignUp, handler);
    }

    public handleSendPasswordResetToken(handler: (email: string) => Observable<SendResetTokenResponse>): void {
        this.messageBus.handleCommand<string, SendResetTokenResponse>(Messages.History.SendPasswordResetToken, handler);
    }

    public handleVerifyPasswordResetToken(handler: (token: string) => Observable<VerifyResetTokenResponse>): void {
        this.messageBus.handleCommand<string, VerifyResetTokenResponse>(Messages.History.VerifyPasswordResetToken, handler);
    }

    public handlePasswordReset(handler: (passwordResetRequest: PasswordResetRequest) => Observable<PasswordResetResponse>): void {
        this.messageBus.handleCommand<PasswordResetRequest, PasswordResetResponse>(Messages.History.ResetPassword, handler);
    }

    public handlePasswordChange(handler: (passwordChangeRequest: PasswordChangeRequest) => Observable<PasswordChangeResponse>): void {
        this.messageBus.handleCommand<PasswordChangeRequest, PasswordChangeResponse>(Messages.History.ChangePassword, handler);
    }

    public handleMergeCandidatesRequest(handler: () => Observable<ReadonlyArray<MergeCandidate>>): void {
        this.messageBus.handleCommand<void, ReadonlyArray<MergeCandidate>>(Messages.History.Merging.MergeCandidates, handler);
    }

    public handleClearStoredUser(handler: () => Observable<void>): void {
        this.messageBus.handleCommand<void>(Messages.History.ClearStoredUser, handler);
    }

    public handleSignInStoredUser(handler: () => Observable<void>): void {
        this.messageBus.handleCommand<void>(Messages.History.SignInStoredUser, handler);
    }

    public subscribeToHistoryUpdate(historyUpdate$: Observable<HistoryRecord>): void {
        this.registerSubscription(historyUpdate$.subscribe(() => this.messageBus.sendNotification(Messages.History.HistoryUpdated)));
    }

    public subscribeToHistorySyncState(isSyncInProgress$: Observable<boolean>): void {
        this.registerSubscription(this.messageBus.registerObservable(Messages.History.AutoSignInState, isSyncInProgress$).subscription);
    }

    public subscribeToHistoryAutoSignInState(isAutoSignInInProgress$: Observable<boolean>): void {
        this.registerSubscription(this.messageBus.registerObservable(Messages.History.SyncState, isAutoSignInInProgress$).subscription);
    }

    public subscribeToHistoryUser(historyUser$: Observable<AccountInfo | null>): void {
        this.registerSubscription(this.messageBus.registerObservable(Messages.History.CurrentUser, historyUser$).subscription);
    }

    public subscribeToStoredUser(historyUser$: Observable<AccountInfo | null>): void {
        this.registerSubscription(this.messageBus.registerObservable(Messages.History.StoredUser, historyUser$).subscription);
    }

    protected getInitialBounds(): Electron.Rectangle {
        const historySettings = this.context.viewsSettings.history;
        return this.getCentralPosition(historySettings.width, historySettings.height);
    }
}