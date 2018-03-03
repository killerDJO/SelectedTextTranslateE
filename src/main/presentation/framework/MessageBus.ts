import { Observable, ReplaySubject } from "rxjs";
import { ipcMain } from "electron";
import { injectable } from "inversify";

import { Channels } from "common/messaging/Messages";

export class MessageBus {
    private static readonly ReplayMessagesNumber: number = 1;

    private observablesRegistry: { [key: string]: ReplaySubject<any> };

    constructor(private readonly window: Electron.BrowserWindow) {
        this.observablesRegistry = {};

        ipcMain.on(Channels.Subscribe, (event: Electron.Event, receivedName: string) => {
            if (event.sender.id !== this.window.webContents.id) {
                return;
            }

            if (!!this.observablesRegistry[receivedName]) {
                this.observablesRegistry[receivedName]
                    .take(MessageBus.ReplayMessagesNumber)
                    .subscribe(value => this.window.webContents.send(Channels.Observe, receivedName, value));
            }
        });
    }

    public registerObservable<TValue>(name: string, observable$: Observable<TValue>): void {
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

    public sendValue<TValue>(name: string, value: TValue): void {
        this.registerObservable(name, Observable.of(value));
    }
}