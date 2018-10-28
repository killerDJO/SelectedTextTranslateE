import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { SignRequest } from "common/dto/history/account/SignRequest";
import { PasswordResetResponse } from "common/dto/history/account/PasswordResetResponse";
import { PasswordResetRequest } from "common/dto/history/account/PasswordResetRequest";
import { SendResetTokenResponse } from "common/dto/history/account/SendResetTokenResponse";
import { VerifyResetTokenResponse } from "common/dto/history/account/VerifyResetTokenResponse";
import { AuthResponse } from "common/dto/history/account/AuthResponse";

import HistoryLogin from "./history-login/HistoryLogin.vue";

export enum Tabs {
    SignIn = "SignIn",
    SignUp = "SignUp",
    RestorePassword = "RestorePassword"
}

const ns = namespace("app/history/sync");

@Component({
    components: {
        HistoryLogin
    }
})
export default class HistorySync extends Vue {
    @ns.State public isSyncInProgress!: boolean;
    @ns.State public signInResponse!: SignInResponse | null;
    @ns.State public signUpResponse!: SignUpResponse | null;
    @ns.State public sendResetTokenResponse!: PasswordResetResponse | null;
    @ns.State public verifyResetTokenResponse!: VerifyResetTokenResponse | null;
    @ns.State public passwordResetResponse!: SendResetTokenResponse | null;

    @ns.Action public readonly setup!: () => void;
    @ns.Action public readonly resetResponses!: () => void;
    @ns.Action public readonly signIn!: (request: SignRequest) => void;
    @ns.Action public readonly signUp!: (request: SignRequest) => void;
    @ns.Action public readonly sendPasswordResetToken!: (email: string) => void;
    @ns.Action public readonly verifyPasswordResetToken!: (token: string) => void;
    @ns.Action public readonly resetPassword!: (request: PasswordResetRequest) => void;
    @ns.Action public readonly signOut!: () => void;
    @ns.Action public readonly showHistorySettings!: () => void;
    @ns.Action public readonly syncOneTime!: () => void;

    @Prop(Object)
    public currentUser!: AccountInfo | null;

    public showLoginDialog: boolean = false;
    public currentDialogTab: Tabs = Tabs.SignIn;
    public isLoginActionInProgress: boolean = false;

    public Tabs: typeof Tabs = Tabs;

    public mounted() {
        this.setup();
    }

    public signIn$(signRequest: SignRequest): void {
        this.runHistoryAction(() => this.signIn(signRequest));
    }

    public signUp$(signRequest: SignRequest): void {
        this.runHistoryAction(() => this.signUp(signRequest));
    }

    public sendPasswordResetToken$(email: string): void {
        this.runHistoryAction(() => this.sendPasswordResetToken(email));
    }

    public verifyPasswordResetToken$(token: string): void {
        this.runHistoryAction(() => this.verifyPasswordResetToken(token));
    }

    public resetPassword$(request: PasswordResetRequest): void {
        this.runHistoryAction(() => this.resetPassword(request));
    }

    @Watch("sendResetTokenResponse")
    @Watch("verifyResetTokenResponse")
    public onResponseSet(newResponse: AuthResponse<any> | null) {
        this.stopAction(newResponse);
    }

    @Watch("signInResponse")
    @Watch("signUpResponse")
    @Watch("passwordResetResponse")
    public onFinalResponseSet(newResponse: AuthResponse<any> | null) {
        this.stopAction(newResponse);
        this.closeModalOnSuccess(newResponse);
    }

    public showSignIn(): void {
        this.showLoginDialog = true;
        this.currentDialogTab = Tabs.SignIn;
    }

    public showSignUp(): void {
        this.showLoginDialog = true;
        this.currentDialogTab = Tabs.SignUp;
    }

    public openSettings(): void {
        this.showHistorySettings();
    }

    private runHistoryAction(action: () => void) {
        this.resetResponses();
        this.isLoginActionInProgress = true;
        action();
    }

    private stopAction(newResponse: AuthResponse<any> | null): void {
        if (newResponse !== null) {
            this.isLoginActionInProgress = false;
        }
    }

    private closeModalOnSuccess(newResponse: AuthResponse<any> | null): void {
        if (newResponse !== null && newResponse.isSuccessful) {
            this.showLoginDialog = false;
        }
    }
}