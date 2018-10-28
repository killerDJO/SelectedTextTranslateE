<template>
  <div class="content-holder" @keyup.enter="confirmIfValid()">
    <div class="login-view">
      <div class="form-group">
        <label>Email address</label>
        <validated-field :validation-message="validationResult.email">
          <input type="text" v-auto-focus v-tab-index class="form-control" placeholder="Email" v-model="data.email">
        </validated-field>
      </div>
      <div class="form-group">
        <label>Password</label>
        <validated-field :validation-message="validationResult.password">
          <password :value.sync="data.password"/>
        </validated-field>
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <validated-field :validation-message="validationResult.passwordConfirmation">
          <password :value.sync="data.passwordConfirmation"/>
        </validated-field>
      </div>
    </div>
    <history-login-footer :confirm-text="'Sign Up'" @confirm="confirmIfValid()" @close="close()" :disabled="!isValid()"/>
  </div>
</template>

<script src="./SignUp.ts" lang="ts"></script>
<style src="./SignUp.scss" lang="scss" scoped></style>
