import * as ffi from "ffi";
import { clipboard } from "electron";
import { Subject } from "rxjs";
import { injectable } from "inversify";
import { SettingsProvider } from "business-logic/settings/SettingsProvider";

@injectable()
export class TextExtractor {

    public readonly textToTranslate$: Subject<string>;

    constructor(private readonly settingsProvider: SettingsProvider) {
        this.textToTranslate$ = new Subject();
    }

    public getSelectedText(): void {
        this.broadcastCopyCommand();

        const copyDelayMilliseconds = this.settingsProvider.getSettings().engine.copyDelayMilliseconds;
        setTimeout(
            () => {
                this.textToTranslate$.next(clipboard.readText());
            },
            copyDelayMilliseconds);
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