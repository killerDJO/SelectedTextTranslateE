export interface IRendererMessageBus {
    receiveTranslateResult(callback: (translateResult: string) => void): void
}