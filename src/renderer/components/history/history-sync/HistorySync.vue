<template>
  <div class="history-sync">
    <div class="drop-wrapper">
      <drop-button
            v-if="currentUser === null"
            :text="'Sing In'"
            @click="showSignIn"
            :dropItems="[{text: 'Sign Up', callback: showSignUp}, {text: 'Settings', callback: openSettings}]"/>
      <drop-button
        v-else
        :text="'Sync Now'"
        @click="syncOneTime"
        :dropItems="[{text: 'Sign Out', callback: signOut}, {text: 'Settings', callback: openSettings}]"/>
      <div v-if="isSyncInProgress" class="sync-indicator" />
    </div>
    <span v-if="currentUser !== null" class="current-user-label">Signed in as {{currentUser.email}}</span>

    <history-login
      :show.sync="showLoginDialog"
      @sign-in="signIn$"
      @sign-up="signUp$"
      @reset-responses="resetResponses"
      :initial-tab="currentDialogTab"
      :sign-in-response="signInResponse"
      :sign-up-response="signUpResponse"
      :is-login-action-in-progress="isLoginActionInProgress"/>
  </div>
</template>

<script src="./HistorySync.ts" lang="ts"></script>
<style src="./HistorySync.scss" lang="scss" scoped></style>
