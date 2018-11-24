<template>
  <modal :show.sync="show$" :is-action-in-progress="isLoginActionInProgress">
    <span slot="header">{{ state === States.SignedOut ? "Sing In to sync history accross devices" : "Edit account" }}</span>
    <div slot="body">
      <div class="login-tabs">
        <span class="login-tab" :class="getTabClass(Tabs.SignIn)" @click="setCurrentTab(Tabs.SignIn)" v-if="isTabVisible(Tabs.SignIn)">Sign In</span>
        <span class="login-tab" :class="getTabClass(Tabs.SignUp)" @click="setCurrentTab(Tabs.SignUp)" v-if="isTabVisible(Tabs.SignUp)">Sign Up</span>
        <span class="login-tab" :class="getTabClass(Tabs.RestorePassword)" @click="setCurrentTab(Tabs.RestorePassword)" v-if="currentTab === Tabs.RestorePassword">Reset Password</span>
        <span class="login-tab" :class="getTabClass(Tabs.ChangePassword)" @click="setCurrentTab(Tabs.ChangePassword)" v-if="isTabVisible(Tabs.ChangePassword)">Change Password</span>
      </div>
      <div class="login-contents">
        <div class="login-content" :class="getTabClass(Tabs.SignIn)">
          <sign-in
            @sign-in="signIn"
            @close="close"
            @restore-password="showRestorePassword"
            @reset-responses="resetResponses"
            :sign-in-response="signInResponse"/>
        </div>
        <div class="login-content" :class="getTabClass(Tabs.SignUp)">
          <sign-up 
            @sign-up="signUp"
            @close="close"
            @reset-responses="resetResponses"
            :sign-up-response="signUpResponse" />
        </div>
        <div class="login-content" :class="getTabClass(Tabs.RestorePassword)">
          <reset-password
            @close="close"
            @send-password-reset-token="sendPasswordResetToken"
            @reset-password="resetPassword"
            @reset-responses="resetResponses"
            @verify-password-reset-token="verifyPasswordResetToken"
            :send-reset-token-response="sendResetTokenResponse"
            :verify-reset-token-response="verifyResetTokenResponse"
            :password-reset-response="passwordResetResponse"/>
        </div>
        <div class="login-content" :class="getTabClass(Tabs.ChangePassword)">
          <change-password
            @close="close"
            @change-password="changePassword"
            @reset-responses="resetResponses"
            :password-change-response="passwordChangeResponse"/>
        </div>
      </div>
      <div class="login-loading-overlay" v-show="isLoginActionInProgress" />
    </div>
  </modal>
</template>

<script src="./HistoryLogin.ts" lang="ts"></script>
<style src="./HistoryLogin.scss" lang="scss" scoped></style>
