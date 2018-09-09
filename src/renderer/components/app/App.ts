import { Component, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Vue from "vue";

import { HotkeySettings } from "common/dto/settings/renderer-settings/RendererSettings";

import { HotkeysRegistry } from "components/app/services/HotkeysRegistry";

const ns = namespace("app");

@Component
export default class App extends Vue {
    @ns.State public accentColor!: string;
    @ns.State public scaleFactor!: number;
    @ns.State public isFrameless!: boolean;
    @ns.State public hotkeySettings!: HotkeySettings | undefined;

    @ns.Action private readonly setup!: () => void;
    @ns.Action private readonly zoomIn!: () => void;
    @ns.Action private readonly zoomOut!: () => void;
    @ns.Action private readonly resetZoom!: () => void;

    private readonly hotkeysRegistry: HotkeysRegistry = new HotkeysRegistry();

    constructor() {
        super();
        this.setup();
    }

    public mounted(): void {
        this.$children.forEach(child => child.$on("hook:updated", this.repaintLayout.bind(this)));
        this.registerHotkeys();
    }

    public repaintLayout(): void {
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
            10);
    }

    @Watch("hotkeySettings", { deep: true })
    public registerHotkeys() {
        this.hotkeysRegistry.unregisterAllHotkeys();
        this.hotkeysRegistry.registerDevToolsHotkey();

        if (!this.hotkeySettings) {
            return;
        }

        this.hotkeysRegistry.registerHotkeys(this.hotkeySettings.zoomIn, this.zoomIn);
        this.hotkeysRegistry.registerHotkeys(this.hotkeySettings.zoomOut, this.zoomOut);
        this.hotkeysRegistry.registerHotkeys(this.hotkeySettings.resetZoom, this.resetZoom);
    }
}