import { Observable, of, BehaviorSubject } from "rxjs";
import { tap, concatMap, map } from "rxjs/operators";
import { injectable } from "inversify";

import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { Messages } from "common/messaging/Messages";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";
import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { AuthResponse } from "common/dto/history/account/AuthResponse";

import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Logger } from "infrastructure/Logger";
import { NotificationSender } from "infrastructure/NotificationSender";
import { UserStore } from "infrastructure/UserStore";
import { MessageBus } from "infrastructure/MessageBus";

@injectable()
export class AccountHandler {
    private readonly messageBus: MessageBus;
    public currentUser$!: BehaviorSubject<AccountInfo | null>;

    constructor(
        private readonly serviceRendererProvider: ServiceRendererProvider,
        private readonly logger: Logger,
        private readonly notificationSender: NotificationSender,
        private readonly userStore: UserStore) {

        this.messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());
        this.currentUser$ = new BehaviorSubject<AccountInfo | null>(null);

        this.setupMessageBus();
        this.signInIfHasSavedData();
    }

    public signInUser(signRequest: SignRequest): Observable<SignInResponse> {
        this.logger.info(`Sign in to account ${signRequest.email}.`);
        return this.messageBus.sendValue<SignRequest, SignInResponse>(Messages.HistorySync.SignIn, signRequest).pipe(
            tap(response => this.trySaveUserCredentials(signRequest, response)),
            tap(response => this.logUnsuccessfulResponse(response))
        );
    }

    public signUpUser(signRequest: SignRequest): Observable<SignUpResponse> {
        this.logger.info(`Sign up to account ${signRequest.email}.`);
        return this.messageBus.sendValue<SignRequest, SignUpResponse>(Messages.HistorySync.SignUp, signRequest).pipe(
            tap(response => this.logUnsuccessfulResponse(response)),
            concatMap(response => response.isSuccessful ? this.signInUser(signRequest).pipe(map(_ => response)) : of(response))
        );
    }

    public sendPasswordResetToken(email: string): Observable<SendResetTokenResponse> {
        this.logger.info(`Sending reset email to account ${email}.`);
        return this.messageBus.sendValue<string, SendResetTokenResponse>(Messages.HistorySync.SendPasswordResetToken, email).pipe(
            tap(response => this.logUnsuccessfulResponse(response))
        );
    }

    public verifyPasswordResetToken(token: string): Observable<VerifyResetTokenResponse> {
        this.logger.info("Verifying password reset token.");
        return this.messageBus.sendValue<string, VerifyResetTokenResponse>(Messages.HistorySync.VerifyPasswordResetToken, token).pipe(
            tap(response => this.logUnsuccessfulResponse(response))
        );
    }

    public resetPassword(resetPasswordRequest: PasswordResetRequest): Observable<PasswordResetResponse> {
        this.logger.info("Resetting password.");
        return this.messageBus.sendValue<PasswordResetRequest, PasswordResetResponse>(Messages.HistorySync.ResetPassword, resetPasswordRequest).pipe(
            tap(response => this.logUnsuccessfulResponse(response))
        );
    }

    public signOutUser(): Observable<void> {
        this.logger.info("Sign out from account");
        return this.messageBus.sendNotification(Messages.HistorySync.SignOut).pipe(
            concatMap(() => this.userStore.clearCurrentUser().pipe(map(() => undefined)))
        );
    }

    private trySaveUserCredentials(signRequest: SignRequest, signResponse: SignInResponse): void {
        if (signResponse.isSuccessful) {
            this.userStore.setCurrentUser({ email: signRequest.email, password: signRequest.password });
        }
    }

    private logUnsuccessfulResponse(signResponse: AuthResponse<any>): void {
        if (!signResponse.isSuccessful) {
            this.logger.info(`Authorization error. ${signResponse.validationCode}`);
        }
    }

    private signInIfHasSavedData(): void {
        this.userStore.getCurrentUser().pipe(concatMap(userInfo => {
            if (!userInfo) {
                return of();
            }
            return this.signInUser({ email: userInfo.email, password: userInfo.password })
                .pipe(tap<SignInResponse>(response => {
                    if (!response.isSuccessful) {
                        this.userStore.clearCurrentUser();
                        this.notificationSender.showNonCriticalError("Error signing in into a history account.", new Error(response.validationCode));
                    }
                }));
        })).subscribe();
    }

    private setupMessageBus(): void {
        this.messageBus.observeCommand<AccountInfo | null>(Messages.HistorySync.CurrentUser).subscribe(this.currentUser$);
    }
}