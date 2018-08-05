import { Observable, ReplaySubject, Subscription as RxJsSubscription, of } from "rxjs";
import { ipcMain } from "electron";
import { take } from "rxjs/operators";

import { Channels } from "common/messaging/Messages";

interface Subscription {
    readonly channel: string;
    readonly callback: Function;
}

export class MessageBus {
    private static readonly ReplayMessagesNumber: number = 1;

    private readonly observablesRegistry: { [key: string]: ReplaySubject<any> };
    private readonly subscriptions: Subscription[] = [];

    constructor(private readonly window: Electron.BrowserWindow) {
        this.observablesRegistry = {};

        const subscription = this.createSubscription(Channels.Subscribe, (event: Electron.Event, receivedName: string) => {
            if (!this.isCurrentWindowEvent(event)) {
                return;
            }

            if (!!this.observablesRegistry[receivedName]) {
                this.observablesRegistry[receivedName]
                    .pipe(take(MessageBus.ReplayMessagesNumber))
                    .subscribe(value => this.window.webContents.send(Channels.Observe, receivedName, value));
            }
        });

        ipcMain.on(subscription.channel, subscription.callback);
    }

    public registerObservable<TValue>(name: string, observable$: Observable<TValue>): RxJsSubscription {
        if (this.observablesRegistry[name]) {
            return observable$.subscribe(value => this.observablesRegistry[name].next(value));
        }

        const subject$ = new ReplaySubject<TValue>(MessageBus.ReplayMessagesNumber);
        subject$.subscribe(value => this.window.webContents.send(Channels.Observe, name, value));
        const subscription = observable$.subscribe(value => {
            if (this.window.isDestroyed()) {
                throw Error("Window has been destroyed. Make sure subscription is disposed properly.");
            }
            subject$.next(value);
        });
        this.observablesRegistry[name] = subject$;
        return subscription;
    }

    public sendValue<TValue>(name: string, value: TValue): void {
        this.registerObservable(name, of(value));
    }

    public sendNotification(name: string): void {
        this.registerObservable(name, of(null));
    }

    public getValue<TValue>(name: string): Observable<TValue> {
        const subject$ = new ReplaySubject<TValue>(1);
        const subscription = this.createSubscription(Channels.Observe, (event: Electron.Event, receivedName: string, observable: TValue) => {
            if (!this.isCurrentWindowEvent(event)) {
                return;
            }

            if (receivedName !== name) {
                return;
            }

            subject$.next(observable);
        });
        ipcMain.on(subscription.channel, subscription.callback);

        return subject$;
    }

    public destroy(): void {
        for (const subscription of this.subscriptions) {
            ipcMain.removeListener(subscription.channel, subscription.callback);
        }
    }

    private createSubscription<TValue>(channel: string, callback: (event: Electron.Event, receivedName: string, value: TValue) => void): Subscription {
        const subscription: Subscription = { channel, callback };
        this.subscriptions.push(subscription);
        return subscription;
    }

    private isCurrentWindowEvent(event: Electron.Event): boolean {
        return event.sender.id === this.window.webContents.id;
    }
} 