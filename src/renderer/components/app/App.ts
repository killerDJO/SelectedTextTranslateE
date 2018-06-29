import { Component, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Vue from "vue";

import { Messages } from "common/messaging/Messages";

const ns = namespace("app");

@Component
export default class App extends Vue {
    @ns.State public accentColor!: string;
    @ns.State public scaleFactor!: number;

    @ns.Action private readonly fetchData!: () => void;

    constructor() {
        super();
        this.fetchData();
    }

    public get accentStyle(): any {
        return {
            "border-color": `#${this.accentColor}`
        };
    }

    public get scaleStyle(): any {
        return {
            zoom: `${this.scaleFactor * 100}%`
        };
    }

    @Watch("scaleFactor")
    @Watch("accentColor")
    private forceRepaint(): void {
        this.$el.style.display = "none";
        // tslint:disable-next-line:no-unused-expression [No need to store this anywhere, the reference is enough]
        this.$el.offsetHeight;
        this.$el.style.display = "block";
    }
}