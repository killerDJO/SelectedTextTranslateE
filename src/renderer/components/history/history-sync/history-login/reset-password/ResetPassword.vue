<template>
  <div class="content-holder">
    <div class="login-view">
      <div class="form-group">
        <label>Email address</label>
        <input type="email" v-auto-focus v-tab-index class="form-control" placeholder="Email" v-model="data.email">
      </div>
    </div>
    <history-login-footer :confirm-text="'Reset Password'" @confirm="confirmIfValid()" @close="close()"/>
  </div>
</template>

<script src="./ResetPassword.ts" lang="ts"></script>
<style src="./ResetPassword.scss" lang="scss" scoped></style>
