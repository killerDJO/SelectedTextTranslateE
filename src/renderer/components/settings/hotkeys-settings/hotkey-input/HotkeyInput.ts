import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Hotkey } from "common/dto/settings/Hotkey";

@Component
export default class HotkeyInput extends Vue {
    private static readonly InputStartedEvent: string = "input-started";
    private static readonly InputCompletedEvent: string = "input-completed";

    private isInputInProgress: boolean = false;
    private keys: string[] = [];

    @Prop(Object)
    public hotkey!: Hotkey | null;

    @Watch("hotkey")
    public onHotkeyChanged(): void {
        this.keys = !!this.hotkey ? this.hotkey.keys : [];
    }

    public get inputValue(): string {
        return `${this.keys.join(" + ")}${this.isInputInProgress ? " + " : ""}`;
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.repeat) {
            return;
        }

        this.preventDefault(event);

        const isModifierKey = this.isModifierKey(event);

        if (!this.isInputInProgress) {
            if (isModifierKey) {
                this.keys = [];
                this.isInputInProgress = true;
            } else if (event.key === "Backspace") {
                this.keys = [];
                this.notifyHotkeyUpdated();
                return;
            } else {
                return;
            }
        }

        if (isModifierKey) {
            this.keys.push(event.key);
        } else {
            this.keys.push(this.getNormalizeKey(event));
            this.notifyHotkeyUpdated();
        }
    }

    public onFocus(): void {
        this.$emit(HotkeyInput.InputStartedEvent);
    }

    public onBlur(): void {
        this.$emit(HotkeyInput.InputCompletedEvent);
        this.handleCompletion();
    }

    public preventDefault(event: Event): void {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    public handleCompletion(): void {
        if (this.isInputInProgress) {
            this.keys = [];
            this.notifyHotkeyUpdated();
        }
    }

    private notifyHotkeyUpdated(): void {
        const hotkey: Hotkey | null = !!this.keys.length
            ? this.createHotkey()
            : null;
        this.$emit("update:hotkey", hotkey);
        this.isInputInProgress = false;
    }

    private getNormalizeKey(event: KeyboardEvent): string {
        const AKeyCode = 65;
        const ZKeyCode = 90;
        if (event.keyCode >= AKeyCode && event.keyCode <= ZKeyCode) {
            return String.fromCharCode(event.keyCode);
        }

        return event.key;
    }

    private isModifierKey(event: KeyboardEvent): boolean {
        return event.key === "Shift" || event.key === "Control" || event.key === "Alt";
    }

    private createHotkey(): Hotkey {
        return { keys: this.keys.slice() };
    }
}