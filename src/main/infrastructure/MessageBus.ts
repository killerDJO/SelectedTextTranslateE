import { Observable, ReplaySubject, Subscription as RxJsSubscription, of, Subject } from "rxjs";
import { ipcMain } from "electron";

import { Channels } from "common/messaging/Messages";
import { Message } from "common/messaging/Message";
import { createMessage } from "common/messaging/create-message";

import { Environment } from "infrastructure/Environment";

interface IpcSubscription {
    readonly channel: string;
    // tslint:disable-next-line:ban-types
    readonly callback: Function;
}

interface MessageRegistration<TResult> {
    readonly value: any;
    readonly received$: Subject<TResult>;
}

export interface RegistrationResult<TResult> {
    readonly subscription: RxJsSubscription;
    readonly received$: Subject<TResult>;
}

export class MessageBus {
    private readonly messageQueue: Map<string, Map<string, MessageRegistration<any>>> = new Map();
    private readonly ipcSubscriptions: IpcSubscription[] = [];
    private readonly rxJsSubscriptions: RxJsSubscription[] = [];

    constructor(private readonly window: Electron.BrowserWindow) {
        this.createSubscription(Channels.Subscribe, (_, name: string) => this.handleSubscribe(name));
        this.createSubscription(Channels.Received, (_, message: Message, result: any) => this.handleReceived(message, result));
    }

    public registerObservable<TValue, TResult = void>(name: string, observable$: Observable<TValue>): RegistrationResult<TResult> {
        const received$ = new Subject<TResult>();
        const subscription = observable$.subscribe(value => {
            if (this.window.isDestroyed()) {
                if (Environment.isDevelopment()) {
                    throw Error("Window has been destroyed. Make sure subscription is disposed properly.");
                }
            }

            const message = createMessage(name);
            const messages = this.messageQueue.get(name) || new Map();
            messages.set(message.id, { value: value, received$: received$ });
            this.messageQueue.set(name, messages);

            this.window.webContents.send(Channels.Observe, message, value);
        });

        return {
            subscription: subscription,
            received$: received$
        };
    }

    public sendValue<TValue, TResult = void>(name: string, value: TValue): Subject<TResult> {
        return this.registerObservable<TValue, TResult>(name, of(value)).received$;
    }

    public sendNotification(name: string): Subject<void> {
        return this.registerObservable(name, of(null)).received$;
    }

    public observeCommand<TValue>(name: string): Observable<TValue> {
        const subject$ = new ReplaySubject<TValue>(1);
        this.handleCommand<TValue>(name, args => {
            subject$.next(args);
            return of(void 0);
        });
        return subject$;
    }

    public handleCommand<TArgs, TResult = void>(name: string, handler: (args: TArgs) => Observable<TResult>): void {
        this.createSubscription(Channels.Observe, async (_, message: Message, args: TArgs) => {
            if (message.name !== name) {
                return;
            }

            this.rxJsSubscriptions.push(handler(args).subscribe(result => this.window.webContents.send(Channels.Observe, message, result)));
        });
    }

    public destroy(): void {
        for (const subscription of this.ipcSubscriptions) {
            ipcMain.removeListener(subscription.channel, subscription.callback);
        }

        for (const subscription of this.rxJsSubscriptions) {
            subscription.unsubscribe();
        }
    }

    private handleSubscribe(name: string): void {
        const messages = this.messageQueue.get(name);
        if (!messages) {
            return;
        }

        for (const [id, messageRegistration] of messages) {
            this.window.webContents.send(Channels.Observe, { id: id, name: name }, messageRegistration.value);
        }
    }

    private handleReceived(message: Message, result: any): void {
        const messages = this.messageQueue.get(message.name);
        if (!messages) {
            return;
        }

        const messageRegistration = messages.get(message.id);
        if (!!messageRegistration) {
            messages.delete(message.id);
            messageRegistration.received$.next(result);
            messageRegistration.received$.complete();
        }
    }

    private createSubscription(channel: string, callback: (event: Electron.Event, ...args: any[]) => void): void {
        const subscriptionCallback = (event: Electron.IpcMainEvent, ...args: any[]) => {
            if (!this.isCurrentWindowEvent(event)) {
                return;
            }

            callback(event, ...args);
        };
        ipcMain.on(channel, subscriptionCallback);
        this.ipcSubscriptions.push({ channel: channel, callback: subscriptionCallback });
    }

    private isCurrentWindowEvent(event: Electron.IpcMainEvent): boolean {
        return event.sender.id === this.window.webContents.id;
    }
}