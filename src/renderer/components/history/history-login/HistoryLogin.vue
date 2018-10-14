<template>
  <modal :show.sync="show$" @confirm="login" :confirmText="getConfirmText()">
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
            <input type="email" class="form-control" placeholder="Email">
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
            <input type="email" class="form-control" placeholder="Email">
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
</template>

<script src="./HistoryLogin.ts" lang="ts"></script>
<style src="./HistoryLogin.scss" lang="scss" scoped></style>
