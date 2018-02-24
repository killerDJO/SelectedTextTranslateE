export interface IMainMessageBus {
    sendTranslateResult(window: Electron.BrowserWindow, translateResult: string): void;
}