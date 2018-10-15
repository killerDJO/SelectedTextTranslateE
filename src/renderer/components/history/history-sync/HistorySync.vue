<template>
  <div>
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
        <span v-if="currentUser !== null">Signed in as {{currentUser.email}}</span>
        <span v-if="isSyncInProgress">Sync in progress</span>

     <modal :show.sync="showLoginDialog" @confirm="confirm" :confirmText="getConfirmText()">
      <span slot="header">Sing In to sync history accross devices</span>
      <div slot="body">
        <div class="login-tabs">
          <span class="login-tab" :class="getTabClass(Tabs.SignIn)" @click="setCurrentTab(Tabs.SignIn)">Sign In</span>
          <span class="login-tab" :class="getTabClass(Tabs.SignUp)" @click="setCurrentTab(Tabs.SignUp)">Sign Up</span>
        </div>
        <div class="login-contents">
          <div class="login-content" :class="getTabClass(Tabs.SignIn)">
            <div class="form-group">
              <label>Email address</label>
              <input type="email" class="form-control" placeholder="Email" v-model="email">
            </div>
            <div class="form-group">
              <label>Password</label>
              <password :value.sync="password"/>
            </div>
            <link-button @click="setCurrentTab(Tabs.RestorePassword)" :text="'Forget Your Password?'" />
          </div>
          <div class="login-content" :class="getTabClass(Tabs.SignUp)">
            <div class="form-group">
              <label>Email address</label>
              <input type="email" class="form-control" placeholder="Email" v-model="email">
            </div>
            <div class="form-group">
              <label>Password</label>
              <password :value.sync="password"/>
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <password :value.sync="passwordConfirmation"/>
            </div>
          </div>
          <div class="login-content" :class="getTabClass(Tabs.RestorePassword)">
            <div class="form-group">
              <label>Email address to send password</label>
              <input type="email" class="form-control" placeholder="Email">
            </div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script src="./HistorySync.ts" lang="ts"></script>
<style src="./HistorySync.scss" lang="scss" scoped></style>
