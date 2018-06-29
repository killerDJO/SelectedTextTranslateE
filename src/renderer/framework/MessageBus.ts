import { Observable, ReplaySubject } from "rxjs";
import { ipcRenderer } from "electron";
import { Channels, Messages } from "common/messaging/Messages";

export class MessageBus {

    public getValue<TValue>(name: Messages): Observable<TValue> {
        const subject$ = new ReplaySubject<TValue>(1);
        ipcRenderer.on(Channels.Observe, (sender: Electron.EventEmitter, receivedName: string, observable: TValue) => {
            if (receivedName !== name) {
                return;
            }
            subject$.next(observable);
        });
        ipcRenderer.send(Channels.Subscribe, name);
        return subject$;
    }

    public sendCommand<TValue>(name: Messages, value?: TValue): void {
        ipcRenderer.send(Channels.Observe, name, value);
    }
}