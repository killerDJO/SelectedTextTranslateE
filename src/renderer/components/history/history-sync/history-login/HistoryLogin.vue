<template>
  <modal :show.sync="show$">
    <span slot="header">Sing In to sync history accross devices</span>
    <div slot="body">
      <div class="login-tabs">
        <span class="login-tab" :class="getTabClass(Tabs.SignIn)" @click="setCurrentTab(Tabs.SignIn)">Sign In</span>
        <span class="login-tab" :class="getTabClass(Tabs.SignUp)" @click="setCurrentTab(Tabs.SignUp)">Sign Up</span>
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
        <div class="login-content" :class="getTabClass(Tabs.RestorePassword)" @close="close">
          <reset-password />
        </div>
      </div>
      <div class="login-loading-overlay" v-show="isLoginActionInProgress" />
    </div>
  </modal>
</template>

<script src="./HistoryLogin.ts" lang="ts"></script>
<style src="./HistoryLogin.scss" lang="scss" scoped></style>
