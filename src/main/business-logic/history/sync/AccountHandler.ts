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
import { PasswordChangeRequest } from "common/dto/history/account/PasswordChangeRequest";
import { PasswordChangeResponse } from "common/dto/history/account/PasswordChangeResponse";

import { ServiceRendererProvider } from "infrastructure/ServiceRendererProvider";
import { Logger } from "infrastructure/Logger";
import { NotificationSender } from "infrastructure/NotificationSender";
import { UserStore } from "infrastructure/UserStore";
import { MessageBus } from "infrastructure/MessageBus";

@injectable()
export class AccountHandler {
    private readonly messageBus: MessageBus;
    public currentUser$: BehaviorSubject<AccountInfo | null> = new BehaviorSubject<AccountInfo | null>(null);
    public storedUser$: BehaviorSubject<AccountInfo | null> = new BehaviorSubject<AccountInfo | null>(null);;
    public isAutoSignInInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private readonly serviceRendererProvider: ServiceRendererProvider,
        private readonly logger: Logger,
        private readonly notificationSender: NotificationSender,
        private readonly userStore: UserStore) {

        this.messageBus = new MessageBus(this.serviceRendererProvider.getServiceRenderer());

        this.setupMessageBus();
        this.signInIfHasSavedData();
    }

    public signInUser(signRequest: SignRequest): Observable<SignInResponse> {
        return this.executeAuthAction(signRequest, Messages.HistorySync.SignIn, `Sign in to account ${signRequest.email}.`).pipe(
            tap(response => this.trySaveUserCredentials(signRequest, response))
        );
    }

    public signInStoredUser(): Observable<void> {
        return this.userStore.getCurrentUser().pipe(concatMap(user => {
            if (!user) {
                this.notificationSender.send("Unable to sign in stored user", "User does not exist");
                return of(undefined);
            }
            return this.signInUser(user).pipe(
                tap(response => {
                    if (!response.isSuccessful) {
                        this.notificationSender.send("Unable to sign in stored user", "Please try again later");
                    }
                }),
                map(() => undefined));
        }));
    }

    public signUpUser(signRequest: SignRequest): Observable<SignUpResponse> {
        return this.executeAuthAction(signRequest, Messages.HistorySync.SignUp, `Sign up to account ${signRequest.email}.`).pipe(
            concatMap(response => response.isSuccessful ? this.signInUser(signRequest).pipe(map(_ => response)) : of(response))
        );
    }

    public sendPasswordResetToken(email: string): Observable<SendResetTokenResponse> {
        return this.executeAuthAction(email, Messages.HistorySync.SendPasswordResetToken, `Sending reset email to account ${email}.`);
    }

    public verifyPasswordResetToken(token: string): Observable<VerifyResetTokenResponse> {
        return this.executeAuthAction(token, Messages.HistorySync.VerifyPasswordResetToken, "Verifying password reset token.");
    }

    public resetPassword(resetPasswordRequest: PasswordResetRequest): Observable<PasswordResetResponse> {
        return this.executeAuthAction(resetPasswordRequest, Messages.HistorySync.ResetPassword, "Resetting password.");
    }

    public changePassword(changePasswordRequest: PasswordChangeRequest): Observable<PasswordChangeResponse> {
        return this.executeAuthAction(changePasswordRequest, Messages.HistorySync.ChangePassword, "Changing password.");
    }

    public signOutUser(): Observable<void> {
        this.logger.info("Sign out from account.");
        return this.messageBus.sendNotification(Messages.HistorySync.SignOut).pipe(
            concatMap(() => this.clearStoredUser())
        );
    }

    public clearStoredUser(): Observable<void> {
        this.logger.info("Clearing stored user.");
        return this.userStore.clearCurrentUser().pipe(
            tap(() => this.storedUser$.next(null)),
            map(() => undefined));
    }

    private executeAuthAction<TRequest, TResponse extends AuthResponse<any>>(request: TRequest, message: string, logMessage: string): Observable<TResponse> {
        this.logger.info(logMessage);
        return this.messageBus.sendValue<TRequest, TResponse>(message, request).pipe(
            tap(response => this.logUnsuccessfulResponse(response))
        );
    }

    private trySaveUserCredentials(signRequest: SignRequest, signResponse: SignInResponse): void {
        if (signResponse.isSuccessful) {
            this.userStore.setCurrentUser({ email: signRequest.email, password: signRequest.password });
        }
    }

    private logUnsuccessfulResponse(signResponse: AuthResponse<any>): void {
        if (!signResponse.isSuccessful) {
            this.logger.info(`Authorization error: ${signResponse.validationCode}.`);
        }
    }

    private signInIfHasSavedData(): void {
        this.userStore.getCurrentUser().pipe(concatMap(userInfo => {
            if (!userInfo) {
                return of();
            }

            this.isAutoSignInInProgress$.next(true);
            return this.signInUser({ email: userInfo.email, password: userInfo.password })
                .pipe(tap<SignInResponse>(response => {
                    if (!response.isSuccessful) {
                        this.notificationSender.showNonCriticalError("Error signing in into a history account.", new Error(response.validationCode));
                    }
                    this.isAutoSignInInProgress$.next(false);
                    this.storedUser$.next(userInfo);
                }));
        })).subscribe();
    }

    private setupMessageBus(): void {
        this.messageBus.observeCommand<AccountInfo | null>(Messages.HistorySync.CurrentUser).subscribe(this.currentUser$);
    }
}