import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";

import SignIn from "./sign-in/SignIn.vue";
import SignUp from "./sign-up/SignUp.vue";
import ResetPassword from "./reset-password/ResetPassword.vue";

export enum Tabs {
    SignIn = "SignIn",
    SignUp = "SignUp",
    RestorePassword = "RestorePassword"
}

@Component({
    components: {
        SignIn,
        SignUp,
        ResetPassword
    }
})
export default class HistoryLogin extends Vue {

    @Prop(Boolean)
    public show!: boolean;

    @Prop(Boolean)
    public isLoginActionInProgress!: boolean;

    @Prop({
        type: String,
        default: Tabs.SignIn
    })
    public initialTab!: Tabs;

    @Prop(Object)
    public signInResponse!: SignInResponse | null;

    @Prop(Object)
    public signUpResponse!: SignUpResponse | null;

    public currentTab: Tabs = Tabs.SignIn;
    public Tabs: typeof Tabs = Tabs;

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

    public signIn(signInData: SignRequest): void {
        this.$emit("sign-in", signInData);
    }

    public signUp(signUpData: SignRequest): void {
        this.$emit("sign-up", signUpData);
    }

    public showRestorePassword(): void {
        this.setCurrentTab(Tabs.RestorePassword);
    }

    public resetResponses(): void {
        this.$emit("reset-responses");
    }

    public close(): void {
        this.show$ = false;
    }
}