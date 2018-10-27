import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { SignRequest } from "common/dto/history/account/SignRequest";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";

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

    @Prop(Object)
    public sendResetTokenResponse!: SendResetTokenResponse | null;

    @Prop(Object)
    public passwordResetResponse!: PasswordResetResponse | null;

    @Prop(Object)
    public verifyResetTokenResponse!: VerifyResetTokenResponse | null;

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
        if (tab !== this.currentTab) {
            this.currentTab = tab;
        }
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

    public sendPasswordResetToken(email: string): void {
        this.$emit("send-password-reset-token", email);
    }

    public verifyPasswordResetToken(token: string): void {
        this.$emit("verify-password-reset-token", token);
    }

    public resetPassword(request: PasswordResetRequest): void {
        this.$emit("reset-password", request);
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