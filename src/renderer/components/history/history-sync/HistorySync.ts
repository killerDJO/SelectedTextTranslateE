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
import { PasswordChangeRequest } from "common/dto/history/account/PasswordChangeRequest";
import { PasswordChangeResponse } from "common/dto/history/account/PasswordChangeResponse";

import HistoryLogin from "components/history/history-sync/history-login/HistoryLogin.vue";
import { States, Tabs } from "components/history/history-sync/history-login/HistoryLogin";

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
    @ns.State public passwordChangeResponse!: PasswordChangeResponse | null;

    @ns.Action public readonly setup!: () => void;
    @ns.Action public readonly resetResponses!: () => void;
    @ns.Action public readonly signIn!: (request: SignRequest) => void;
    @ns.Action public readonly signUp!: (request: SignRequest) => void;
    @ns.Action public readonly sendPasswordResetToken!: (email: string) => void;
    @ns.Action public readonly verifyPasswordResetToken!: (token: string) => void;
    @ns.Action public readonly resetPassword!: (request: PasswordResetRequest) => void;
    @ns.Action public readonly changePassword!: (request: PasswordChangeRequest) => void;
    @ns.Action public readonly signOut!: () => void;
    @ns.Action public readonly showHistorySettings!: () => void;
    @ns.Action public readonly syncOneTime!: () => void;
    @ns.Action public readonly syncOneTimeForced!: () => void;

    @Prop(Object)
    public currentUser!: AccountInfo | null;

    public showLoginDialog: boolean = false;
    public currentDialogTab: Tabs = Tabs.SignIn;
    public isLoginActionInProgress: boolean = false;

    public Tabs: typeof Tabs = Tabs;

    public mounted() {
        this.setup();
    }

    public get loginState(): States {
        return this.currentUser !== null ? States.SignedIn : States.SignedOut;
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

    public changePassword$(request: PasswordChangeRequest): void {
        this.runHistoryAction(() => this.changePassword(request));
    }

    @Watch("sendResetTokenResponse")
    @Watch("verifyResetTokenResponse")
    public onResponseSet(newResponse: AuthResponse<any> | null) {
        this.stopAction(newResponse);
    }

    @Watch("signInResponse")
    @Watch("signUpResponse")
    @Watch("passwordResetResponse")
    @Watch("passwordChangeResponse")
    public onFinalResponseSet(newResponse: AuthResponse<any> | null) {
        this.stopAction(newResponse);
        this.closeModalOnSuccess(newResponse);
    }

    public showSignIn(): void {
        this.showLoginTab(Tabs.SignIn);
    }

    public showSignUp(): void {
        this.showLoginTab(Tabs.SignUp);
    }

    public showChangePassword(): void {
        this.showLoginTab(Tabs.ChangePassword);
    }

    public openSettings(): void {
        this.showHistorySettings();
    }

    private showLoginTab(tab: Tabs): void {
        this.showLoginDialog = true;
        this.currentDialogTab = tab;
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