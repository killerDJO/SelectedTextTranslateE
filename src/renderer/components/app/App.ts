import { Component, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Vue from "vue";
import { remote } from "electron";

import { HotkeySettings } from "common/dto/settings/renderer-settings/RendererSettings";
import { Hotkey } from "common/dto/settings/Hotkey";

import { hotkeysRegistry } from "services/HotkeysRegistry";

const ns = namespace("app");

@Component
export default class App extends Vue {
    private static readonly GlobalHotkeysNamespace: string = "global";

    @ns.State public accentColor!: string;
    @ns.State public scaleFactor!: number;
    @ns.State public isFrameless!: boolean;
    @ns.State public hotkeySettings!: HotkeySettings | undefined;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly zoomIn!: () => void;
    @ns.Action private readonly zoomOut!: () => void;
    @ns.Action private readonly resetZoom!: () => void;

    constructor() {
        super();
        this.setup();
        this.registerDevToolsHotkey();
    }

    public mounted(): void {
        this.$children.forEach(child => child.$on("hook:updated", this.repaintLayout.bind(this)));
        this.registerHotkeys();
    }

    public repaintLayout(): void {
        const RepaintTimeout = 10;
        setTimeout(
            () => {
                const scrollHolder = this.$el.getElementsByClassName("scroll-holder")[0] as HTMLElement;
                if (scrollHolder === null) {
                    return;
                }
                const originalWidth = scrollHolder.style.width;
                scrollHolder.style.width = "auto";
                const hight = scrollHolder.offsetHeight;
                scrollHolder.style.width = originalWidth;
            },
            RepaintTimeout);
    }

    @Watch("hotkeySettings", { deep: true })
    public registerHotkeys() {
        hotkeysRegistry.unregisterHotkeys(App.GlobalHotkeysNamespace);

        if (!this.hotkeySettings) {
            return;
        }

        hotkeysRegistry.registerHotkeys(App.GlobalHotkeysNamespace, this.hotkeySettings.zoomIn, this.zoomIn);
        hotkeysRegistry.registerHotkeys(App.GlobalHotkeysNamespace, this.hotkeySettings.zoomOut, this.zoomOut);
        hotkeysRegistry.registerHotkeys(App.GlobalHotkeysNamespace, this.hotkeySettings.resetZoom, this.resetZoom);
    }

    public registerDevToolsHotkey(): void {
        const devToolsHotkey: Hotkey = { keys: ["ctrl", "shift", "i"] };
        hotkeysRegistry.registerHotkeys("devtools", [devToolsHotkey], () => remote.getCurrentWindow().webContents.toggleDevTools());
    }
}