import { Observable, ReplaySubject } from "rxjs";
import { ipcRenderer } from "electron";
import { Channels } from "common/messaging/Messages";

export class MessageBus {

    public getValue<TValue>(name: string): Observable<TValue> {
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
}