import { Observable, ReplaySubject, Subscription as RxJsSubscription, of, Subject } from "rxjs";
import { ipcMain } from "electron";

import { Channels } from "common/messaging/Messages";
import { Message } from "common/messaging/Message";
import { createMessage } from "common/messaging/create-message";

interface IpcSubscription {
    readonly channel: string;
    // tslint:disable-next-line:ban-types
    readonly callback: Function;
}

interface MessageRegistration {
    readonly value: any;
    readonly received$: Subject<void>;
}

export interface RegistrationResult {
    readonly subscription: RxJsSubscription;
    readonly received$: Subject<void>;
}

export class MessageBus {
    private readonly messageQueue: Map<string, Map<string, MessageRegistration>> = new Map();
    private readonly ipcSubscriptions: IpcSubscription[] = [];

    constructor(private readonly window: Electron.BrowserWindow) {
        this.createSubscription(Channels.Subscribe, (_, name: string) => this.handleSubscribe(name));
        this.createSubscription(Channels.Received, (_, message: Message) => this.handleReceived(message));
    }

    public registerObservable<TValue>(name: string, observable$: Observable<TValue>): RegistrationResult {
        const received$ = new Subject<void>();
        const subscription = observable$.subscribe(value => {
            if (this.window.isDestroyed()) {
                throw Error("Window has been destroyed. Make sure subscription is disposed properly.");
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

    public sendValue<TValue>(name: string, value: TValue): Subject<void> {
        return this.registerObservable(name, of(value)).received$;
    }

    public sendNotification(name: string): Subject<void> {
        return this.registerObservable(name, of(null)).received$;
    }

    public observeCommand<TValue>(name: string): Observable<TValue> {
        const subject$ = new ReplaySubject<TValue>(1);
        this.handleCommand<TValue, void>(name, args => {
            subject$.next(args);
            return of(void 0);
        });
        return subject$;
    }

    public handleCommand<TArgs, TResult = void>(name: string, handler: (args: TArgs) => Observable<TResult>): void {
        this.createSubscription(Channels.Observe, async (event: Electron.Event, message: Message, args: TArgs) => {
            if (message.name !== name) {
                return;
            }

            handler(args).subscribe(result => this.window.webContents.send(Channels.Observe, message, result));
        });
    }

    public destroy(): void {
        for (const subscription of this.ipcSubscriptions) {
            ipcMain.removeListener(subscription.channel, subscription.callback);
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

    private handleReceived(message: Message): void {
        const messages = this.messageQueue.get(message.name);
        if (!messages) {
            return;
        }

        const messageRegistration = messages.get(message.id);
        if (!!messageRegistration) {
            messages.delete(message.id);
            messageRegistration.received$.next();
            messageRegistration.received$.complete();
        }
    }

    private createSubscription(channel: string, callback: (event: Electron.Event, ...args: any[]) => void): void {
        const subscriptionCallback = (event: Electron.Event, ...args: any[]) => {
            if (!this.isCurrentWindowEvent(event)) {
                return;
            }

            callback(event, ...args);
        };
        ipcMain.on(channel, subscriptionCallback);
        this.ipcSubscriptions.push({ channel: channel, callback: subscriptionCallback });
    }

    private isCurrentWindowEvent(event: Electron.Event): boolean {
        return event.sender.id === this.window.webContents.id;
    }
}