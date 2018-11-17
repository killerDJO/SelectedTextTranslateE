<template>
  <div class="content-holder" @keyup.enter="confirmIfValid()">
    <div class="login-view">
      <div class="form-group">
        <label>Current Password</label>
        <validated-field :validation-message="validationResult.oldPassword">
          <password :value.sync="data.oldPassword"/>
        </validated-field>
      </div>
      <div class="form-group">
        <label>New Password</label>
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
    <history-login-footer :confirm-text="'Change Password'" @confirm="confirmIfValid()" @close="close()" :disabled="!isValid()"/>
  </div>
</template>

<script src="./ChangePassword.ts" lang="ts"></script>
<style src="./ChangePassword.scss" lang="scss" scoped></style>
