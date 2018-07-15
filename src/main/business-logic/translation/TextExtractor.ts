import * as ffi from "ffi";
import { clipboard } from "electron";
import { Subject, Observable } from "rxjs";
import { injectable } from "inversify";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class TextExtractor {

    constructor(private readonly settingsProvider: SettingsProvider) {
    }

    public getSelectedText(): Observable<string> {
        this.broadcastCopyCommand();

        const textToTranslate$ = new Subject<string>();
        const copyDelayMilliseconds = this.settingsProvider.getSettings().engine.copyDelayMilliseconds;
        setTimeout(
            () => {
                textToTranslate$.next(clipboard.readText());
                textToTranslate$.complete();
            },
            copyDelayMilliseconds);

        return textToTranslate$;
    }

    private broadcastCopyCommand(): void {
        const User32Lib = ffi.Library("User32", {
            MapVirtualKeyW: ["uint32", ["uint32", "uint32"]],
            keybd_event: ["void", ["byte", "byte", "uint32", "uint64"]]
        });

        const VK_C = 0x43;
        const VK_CTRL = 0x11;
        const KEYEVENTF_KEYUP = 0x0002;
        const CTRLScanCode = User32Lib.MapVirtualKeyW(VK_CTRL, 0);
        const CScanCode = User32Lib.MapVirtualKeyW(VK_C, 0);

        User32Lib.keybd_event(VK_CTRL, CTRLScanCode, 0, 0);
        User32Lib.keybd_event(VK_C, CScanCode, 0, 0);
        User32Lib.keybd_event(VK_C, CScanCode, KEYEVENTF_KEYUP, 0);
        User32Lib.keybd_event(VK_CTRL, CTRLScanCode, KEYEVENTF_KEYUP, 0);
    }
}