import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { EditableHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";

import HotkeyInput from "components/settings/hotkeys-settings/hotkey-input/HotkeyInput.vue";
import { Hotkey } from "common/dto/settings/Hotkey";

interface Command {
    readonly name: string;
    readonly key: string;
    hotkeys: Hotkey[];
}

@Component({
    components: {
        HotkeyInput
    }
})
export default class HotkeySettings extends Vue {
    @Prop(Object)
    public readonly hotkeySettings!: EditableHotkeySettings;

    private static readonly HotkeyInputStartedEvent: string = "hotkey-input-started";
    private static readonly HotkeyInputCompletedEvent: string = "hotkey-input-completed";

    private readonly commands: Command[] = [];
    private readonly hotkeyToCommandMap = new Map<keyof EditableHotkeySettings, string>([
        ["translate", "Translate Text"],
        ["playText", "Play Text"],
        ["zoomIn", "Zoom In"],
        ["zoomOut", "Zoom Out"]
    ]);

    public currentCommand: Command | null = null;
    public currentHotkey: Hotkey | null = null;
    public currentHotkeyValidationMessage: string | null = null;

    public mounted() {
        this.createCommandsList();
        this.currentCommand = this.commands[0];
    }

    public get currentCommandKey(): string {
        if (!this.currentCommand) {
            return "";
        }
        return this.currentCommand.key;
    }

    public set currentCommandKey(key: string) {
        const currentCommand = this.commands.find(command => command.key === key);
        if (!currentCommand) {
            return;
        }
        this.currentCommand = currentCommand;
    }

    public get isAddHotkeyEnabled(): boolean {
        return !this.currentHotkeyValidationMessage && !!this.currentHotkey;
    }

    public removeHotkey(hotkeyToRemove: Hotkey): void {
        if (!this.currentCommand) {
            return;
        }
        const newHotkeys: Hotkey[] = [];
        this.currentCommand.hotkeys.forEach(hotkey => {
            if (this.createHotkeyString(hotkey) !== this.createHotkeyString(hotkeyToRemove)) {
                newHotkeys.push(hotkey);
            }
        });
        this.currentCommand.hotkeys = newHotkeys;
    }

    public addHotkey(): void {
        if (!this.currentCommand || !this.currentHotkey) {
            return;
        }
        this.currentCommand.hotkeys.push(this.currentHotkey);
        this.currentHotkey = null;
    }

    public hotkeyInputStarted(): void {
        this.$emit(HotkeySettings.HotkeyInputStartedEvent);
    }

    public hotkeyInputCompleted(): void {
        this.$emit(HotkeySettings.HotkeyInputCompletedEvent);
    }

    public createHotkeyString(hotkey: Hotkey): string {
        return hotkey.keys.join(" + ");
    }

    @Watch("currentHotkey", { deep: true })
    public validateCurrentHotkey() {
        if (!this.currentHotkey) {
            this.currentHotkeyValidationMessage = null;
            return;
        }

        const currentHotkeyId = this.createHotkeyString(this.currentHotkey);
        for (const command of this.commands) {
            for (const hotkey of command.hotkeys) {
                if (this.createHotkeyString(hotkey) === currentHotkeyId) {
                    this.currentHotkeyValidationMessage = `Hotkey conflicts with another one for the '${command.name}' command.`;
                    return;
                }
            }
        }
        this.currentHotkeyValidationMessage = null;
    }

    private createCommandsList(): void {
        for (const [key, value] of this.hotkeyToCommandMap) {
            this.commands.push({
                name: value,
                key: key,
                hotkeys: this.hotkeySettings[key]
            });
        }
    }
}