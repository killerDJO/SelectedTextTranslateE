import { Component, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Vue from "vue";

import { Messages } from "common/messaging/Messages";

const ns = namespace("app");

@Component
export default class App extends Vue {
    @ns.State public accentColor!: string;
    @ns.State public scaleFactor!: number;
    @ns.State public isFrameless!: boolean;

    @ns.Action private readonly fetchData!: () => void;

    constructor() {
        super();
        this.fetchData();
    }

    public mounted(): void {
        this.$children.forEach(child => child.$on("hook:updated", this.repaintLayout.bind(this)));
    }

    public repaintLayout(): void {
        setTimeout(() => {
            const scrollHolder = this.$el.getElementsByClassName("scroll-holder")[0] as HTMLElement;
            if (scrollHolder === null) {
                return;
            }
            const originalWidth = scrollHolder.style.width;
            scrollHolder.style.width = "auto";
            const hight = scrollHolder.offsetHeight;
            scrollHolder.style.width = originalWidth;
        }, 10);
    }
}