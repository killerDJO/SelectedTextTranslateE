import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";

import { AccountInfo } from "common/dto/history/account/AccountInfo";
import { SignInResponse } from "common/dto/history/account/SignInResponse";
import { SignUpResponse } from "common/dto/history/account/SignUpResponse";
import { SignRequest } from "common/dto/history/account/SignRequest";

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

    @ns.Action public readonly setup!: () => void;
    @ns.Action public readonly resetResponses!: () => void;
    @ns.Action public readonly signIn!: (request: SignRequest) => void;
    @ns.Action public readonly signUp!: (request: SignRequest) => void;
    @ns.Action public readonly signOut!: () => void;
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
        this.resetResponses();
        this.isLoginActionInProgress = true;
        this.signIn(signRequest);
    }

    public signUp$(signRequest: SignRequest): void {
        this.resetResponses();
        this.isLoginActionInProgress = true;
        this.signUp(signRequest);
    }

    @Watch("signInResponse")
    @Watch("signUpResponse")
    public onResponseSet(newResponse: SignInResponse | null) {
        if (newResponse !== null) {
            this.isLoginActionInProgress = false;

            if (newResponse.isSuccessful) {
                this.showLoginDialog = false;
            }
        }
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