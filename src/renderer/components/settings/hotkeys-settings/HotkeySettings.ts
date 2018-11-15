import * as _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { EditableHotkeySettings, LocalHotkeySettings, GlobalHotkeySettings } from "common/dto/settings/editable-settings/EditableHotkeySettings";
import { Hotkey } from "common/dto/settings/Hotkey";

import HotkeyInput from "components/settings/hotkeys-settings/hotkey-input/HotkeyInput.vue";
import SettingsHolder from "components/settings/settings-holder/SettingsHolder.vue";

interface Command {
    readonly name: string;
    readonly key: string;
    readonly isGlobal: boolean;
    hotkeys: Hotkey[];
}

@Component({
    components: {
        HotkeyInput,
        SettingsHolder
    }
})
export default class HotkeySettings extends Vue {
    @Prop(Object)
    public readonly hotkeySettings!: EditableHotkeySettings;
    @Prop(Object)
    public readonly defaultHotkeySettings!: EditableHotkeySettings;

    private static readonly HotkeyInputStartedEvent: string = "hotkey-input-started";
    private static readonly HotkeyInputCompletedEvent: string = "hotkey-input-completed";
    private static readonly HotkeysUpdatedEvent: string = "hotkeys-updated";

    private readonly hotkeysDisplayName = new Map<keyof LocalHotkeySettings | keyof GlobalHotkeySettings, string>([
        ["translate", "Translate Text"],
        ["playText", "Play Text"],
        ["showDefinition", "Show Definition"],
        ["inputText", "Input Text"],
        ["toggleSuspend", "Toggle Suspended State"],
        ["zoomIn", "Zoom In"],
        ["zoomOut", "Zoom Out"],
        ["resetZoom", "Reset Zoom"]
    ]);

    private commands: Command[] = [];
    public currentCommandIndex: number = 0;
    public currentHotkey: Hotkey | null = null;
    public currentHotkeyValidationMessage: string | null = null;
    public showResetHotkeysModal: boolean = false;

    public get currentCommand(): Command {
        return this.commands[this.currentCommandIndex];
    }

    public get currentCommandKey(): string {
        return this.currentCommand.key;
    }

    public set currentCommandKey(key: string) {
        const currentCommand = this.commands.find(command => command.key === key);
        if (!currentCommand) {
            return;
        }
        this.currentCommandIndex = this.commands.indexOf(currentCommand);
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
        this.validateCurrentHotkey();
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

    @Watch("commands", { deep: true })
    public updateHotkeySettings(): void {
        const updatedHotkeySettings = _.cloneDeep(this.hotkeySettings);

        for (const command of this.commands) {
            const hotkeys = this.getHotkeySetting(command.key, updatedHotkeySettings).hotkeys;
            hotkeys.length = 0;
            hotkeys.push(...command.hotkeys);
        }

        this.$emit(HotkeySettings.HotkeysUpdatedEvent, updatedHotkeySettings);
    }

    public resetHotkeySettings(): void {
        this.$emit(HotkeySettings.HotkeysUpdatedEvent, this.defaultHotkeySettings);
    }

    @Watch("hotkeySettings", { immediate: true })
    public createCommandsList(): void {
        this.commands = [];
        for (const [key, value] of this.hotkeysDisplayName) {
            const hotkeySettings = _.cloneDeep(this.getHotkeySetting(key, this.hotkeySettings));
            this.commands.push({
                name: value,
                key: key,
                hotkeys: hotkeySettings.hotkeys,
                isGlobal: hotkeySettings.isGlobal
            });
        }
    }

    private getHotkeySetting(key: string, settings: EditableHotkeySettings): { hotkeys: Hotkey[]; isGlobal: boolean } {
        const hotkeyTypes: Array<keyof EditableHotkeySettings> = ["global", "local"];
        for (const hotkeyType of hotkeyTypes) {
            for (const currentKey of Object.keys(settings[hotkeyType])) {
                if (currentKey === key) {
                    return { hotkeys: (settings[hotkeyType] as any)[currentKey], isGlobal: hotkeyType === "global" };
                }
            }
        }

        throw Error(`Unable to find key '${key}'.`);
    }
}