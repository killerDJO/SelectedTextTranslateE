import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { Observable, Subscription } from 'rxjs';

import { createChannel } from '@selected-text-translate/common/messaging/create-channel';

export class MessageBus {
  constructor(
    private window: BrowserWindow,
    private registerSubscription: (subscription: Subscription) => void,
    private onceViewReady: (callback: () => void) => void
  ) {}

  public registerObservable<TValue>(message: string, observable$: Observable<TValue>): void {
    this.registerSubscription(
      observable$.subscribe(value => {
        if (this.window.isDestroyed()) {
          if (app.isPackaged) {
            throw Error('Window has been destroyed. Make sure subscription is disposed properly.');
          }
        }

        this.onceViewReady(() => this.window.webContents.send(message, value));
      })
    );
  }

  public sendMessage<TArgs extends unknown[]>(message: string, ...args: TArgs): void {
    this.onceViewReady(() => this.window.webContents.send(message, ...args));
  }

  public listenToMessage<TArgs extends unknown[], TResult = void>(
    message: string,
    handler: (...args: TArgs) => TResult
  ): void {
    const channel = createChannel(message, this.window.id);
    ipcMain.handle(channel, (_: IpcMainEvent, ...args: TArgs) => handler(...args));

    // Register for cleanup
    this.registerSubscription(new Subscription(() => ipcMain.removeHandler(channel)));
  }

  public observeMessage<TResult>(message: string): Observable<TResult> {
    return new Observable(subscriber => {
      this.listenToMessage<[TResult]>(message, result => subscriber.next(result));
    });
  }
}
