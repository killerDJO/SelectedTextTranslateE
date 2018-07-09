import { Observable, ReplaySubject } from "rxjs";
import { ipcMain } from "electron";

import { Channels, Messages } from "common/messaging/Messages";

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
                    .take(MessageBus.ReplayMessagesNumber)
                    .subscribe(value => this.window.webContents.send(Channels.Observe, receivedName, value));
            }
        });

        ipcMain.on(subscription.channel, subscription.callback);
    }

    public registerValue<TValue>(name: Messages, value: TValue): void {
        this.registerObservable(name, Observable.of(value));
    }

    public registerObservable<TValue>(name: Messages, observable$: Observable<TValue>): void {
        if (this.observablesRegistry[name]) {
            observable$.subscribe(value => this.observablesRegistry[name].next(value));
            return;
        }

        const subject$ = new ReplaySubject<TValue>(MessageBus.ReplayMessagesNumber);
        subject$.subscribe(value => this.window.webContents.send(Channels.Observe, name, value));
        observable$.subscribe(value => {
            subject$.next(value);
        });
        this.observablesRegistry[name] = subject$;
    }

    public sendValue<TValue>(name: Messages, value: TValue): void {
        this.registerObservable(name, Observable.of(value));
    }

    public getValue<TValue>(name: Messages): Observable<TValue> {
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
        for (const callback of this.subscriptions) {
            ipcMain.removeListener(callback.channel, callback.callback);
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