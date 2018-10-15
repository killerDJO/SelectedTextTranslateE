import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignInRequest } from "common/dto/history/account/SignInRequest";

export enum Tabs {
    SignIn = "SignIn",
    SignUp = "SignUp",
    RestorePassword = "RestorePassword"
}

const ns = namespace("app/history/sync");

@Component
export default class HistorySync extends Vue {
    @ns.State public currentUser!: AccountInfo | null;
    @ns.State public isSyncInProgress!: boolean;
    @ns.State public signInResponse!: SignInResponse | null;
    @ns.State public signUpResponse!: SignInResponse | null;

    @ns.Action public readonly setup!: () => void;
    @ns.Action public readonly signIn!: (request: SignInRequest) => void;
    @ns.Action public readonly signUp!: (request: SignInRequest) => void;
    @ns.Action public readonly signOut!: () => void;
    @ns.Action public readonly syncOneTime!: () => void;

    public showLoginDialog: boolean = false;
    public currentDialogTab: Tabs = Tabs.SignIn;
    public Tabs: typeof Tabs = Tabs;

    public email: string = "";
    public password: string = "";
    public passwordConfirmation: string = "";

    public mounted() {
        this.setup();
    }

    public setCurrentTab(tab: Tabs): void {
        this.currentDialogTab = tab;
    }

    public getTabClass(tab: Tabs): string {
        return this.currentDialogTab === tab ? "active" : "";
    }

    public confirm(): void {
        const singInRequest: SignInRequest = {
            email: this.email,
            password: this.password
        };
        if (this.currentDialogTab === Tabs.SignIn) {
            this.signIn(singInRequest);
        } else if (this.currentDialogTab === Tabs.SignUp) {
            this.signUp(singInRequest);
        }
    }

    public getConfirmText(): string {
        const cases = {
            [Tabs.SignIn]: "Sign In",
            [Tabs.SignUp]: "Sign Up",
            [Tabs.RestorePassword]: "Reset Password",
        };

        return cases[this.currentDialogTab];
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
        console.log("openSettings");
    }
}