import { ViewBase } from "../../main/presentation/views/ViewBase";

export interface IMainMessageBus {
    sendTranslateResult(window: Electron.BrowserWindow, translateResult: string): void
}