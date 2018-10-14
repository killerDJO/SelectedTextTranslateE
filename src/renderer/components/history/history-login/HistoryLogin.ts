import { Component, Vue, Prop, Watch } from "vue-property-decorator";

export enum Tabs {
    SignIn = "SignIn",
    SignUp = "SignUp",
    RestorePassword = "RestorePassword"
}

@Component
export default class HistoryLogin extends Vue {

    @Prop(Boolean)
    public show!: boolean;

    @Prop({
        type: String,
        default: Tabs.SignIn
    })
    public initialTab!: Tabs;

    public currentTab: Tabs = Tabs.SignIn;
    public Tabs: typeof Tabs = Tabs;

    public password: string = "";
    public passwordConfirmation: string = "";

    @Watch("show")
    public onShown() {
        if (this.show) {
            this.currentTab = this.initialTab;
        }
    }

    public get show$(): boolean {
        return this.show;
    }

    public set show$(show: boolean) {
        this.$emit("update:show", show);
    }

    public setCurrentTab(tab: Tabs): void {
        this.currentTab = tab;
    }

    public getTabClass(tab: Tabs): string {
        return this.currentTab === tab ? "active" : "";
    }

    public login(): void {
        this.$emit("login");
    }

    public getConfirmText(): string {
        const cases = {
            [Tabs.SignIn]: "Sign In",
            [Tabs.SignUp]: "Sign Up",
            [Tabs.RestorePassword]: "Reset Password",
        };

        return cases[this.currentTab];
    }
}