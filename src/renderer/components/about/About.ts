import Vue from "vue";
import { Component } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ApplicationInfo } from "common/dto/about/ApplicationInfo";
import { shell } from "electron";

const ns = namespace("app/about");

@Component
export default class About extends Vue {
    @ns.State public info!: ApplicationInfo | null;

    @ns.Action private readonly setup!: () => void;
    @ns.Action public readonly checkForUpdates!: () => void;

    constructor() {
        super();
        this.setup();
    }

    public get isInitialized(): boolean {
        return this.info !== null;
    }

    public openHomePage(): void {
        if (!this.info) {
            return;
        }

        shell.openExternal(this.info.homepage);
    }
}