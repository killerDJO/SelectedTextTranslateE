<template>
  <div class="history-sync">
    <div class="drop-wrapper">
      <drop-list-button
            v-if="currentUser === null"
            :text="'Sign In'"
            :overflow-position="'start'"
            @click="showSignIn"
            :items="signedOutDropOptions"/>
      <drop-list-button
        v-else
        :text="'Sync Now'"
        :overflow-position="'start'"
        @click="syncOneTime"
        :items="[{text: 'Sign Out', callback: signOut}, {text: 'Settings', callback: openSettings}, {text: 'Change Password', callback: showChangePassword}, {text: 'Forced Sync', callback: syncOneTimeForced}]"/>
      <div v-if="isSyncInProgress || isLoginActionInProgress || isAutoSignInInProgress" class="sync-indicator" />
    </div>
    <span v-if="currentUser !== null" class="user-label">Signed in as {{currentUser.email}}</span>
    <span v-if="storedUser !== null && currentUser === null && !isLoginActionInProgress && !isAutoSignInInProgress" class="user-label">
      Sign in as <link-button @click="signInStoredUser$" :text="storedUser.email" class="sign-in-stored-user"/>
    </span>

    <history-login
      :show.sync="showLoginDialog"
      @sign-in="signIn$"
      @sign-up="signUp$"
      @send-password-reset-token="sendPasswordResetToken$"
      @verify-password-reset-token="verifyPasswordResetToken$"
      @reset-password="resetPassword$"
      @change-password="changePassword$"
      @reset-responses="resetResponses"
      :state="loginState"
      :initial-tab="currentDialogTab"
      :sign-in-response="signInResponse"
      :sign-up-response="signUpResponse"
      :send-reset-token-response="sendResetTokenResponse"
      :password-reset-response="passwordResetResponse"
      :password-change-response="passwordChangeResponse"
      :verify-reset-token-response="verifyResetTokenResponse"
      :is-login-action-in-progress="isLoginActionInProgress"/>
  </div>
</template>

<script src="./HistorySync.ts" lang="ts"></script>
<style src="./HistorySync.scss" lang="scss" scoped></style>
