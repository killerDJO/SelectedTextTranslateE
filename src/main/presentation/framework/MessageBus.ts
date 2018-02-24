import { Observable, ReplaySubject } from "rxjs";
import { ipcMain } from "electron";
import { Channels } from "common/messaging/Messages";

export class MessageBus {
    private static readonly ReplayMessagesNumber: number = 1;

    private observablesRegistry: { [key: string]: any };

    constructor(private readonly window: Electron.BrowserWindow) {
        this.observablesRegistry = {};
    }

    public registerObservable<TValue>(name: string, observable$: Observable<TValue>): void {
        const subject$ = this.observablesRegistry[name] as ReplaySubject<TValue> || new ReplaySubject<TValue>(MessageBus.ReplayMessagesNumber);
        this.observablesRegistry[name] = subject$;

        observable$.subscribe(subject$);

        subject$.subscribe(value => this.window.webContents.send(Channels.Observe, name, value));

        ipcMain.on(Channels.Subscribe, (sender: Electron.EventEmitter, receivedName: string) => {
            if (receivedName === name) {
                subject$.take(MessageBus.ReplayMessagesNumber).subscribe(value => this.window.webContents.send(Channels.Observe, name, value));
            }
        });
    }

    public sendValue<TValue>(name: string, value: TValue): void {
        const subject$ = this.observablesRegistry[name] as ReplaySubject<TValue> || new ReplaySubject<TValue>(MessageBus.ReplayMessagesNumber);
        this.observablesRegistry[name] = subject$;

        subject$.next(value);
        subject$.complete();

        subject$.subscribe(lastValue => this.window.webContents.send(Channels.Observe, name, lastValue));

        ipcMain.on(Channels.Subscribe, (sender: Electron.EventEmitter, receivedName: string) => {
            if (receivedName === name) {
                subject$.take(MessageBus.ReplayMessagesNumber).subscribe(lastValue => this.window.webContents.send(Channels.Observe, name, lastValue));
            }
        });
    }
}