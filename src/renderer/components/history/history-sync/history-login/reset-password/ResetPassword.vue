<template>
  <div class="content-holder">
    <div class="login-view">
      <div class="form-group">
        <label>Email address</label>
        <validated-field :validation-message="validationResult.email">
          <input type="text" v-auto-focus v-tab-index class="form-control" placeholder="Email" v-model="data.email" :disabled="isEmailDisabled">
        </validated-field>
        <div class="email-actions" v-if="isEmailDisabled">
          <link-button @click="changeEmail" :text="'Change Email'" />
          <link-button @click="resendEmail" :text="'Resend Email'" v-if="currentStep === ResetPasswordStep.Token"/>
        </div>
      </div>
      <div class="form-group" v-if="currentStep === ResetPasswordStep.Token">
        <label>Confirmation Token</label>
        <validated-field :validation-message="validationResult.token">
          <input type="text" v-auto-focus v-tab-index class="form-control" placeholder="Confrimation Token" v-model="data.token">
        </validated-field>
      </div>
      <div v-if="currentStep === ResetPasswordStep.Password">
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
    </div>
    <history-login-footer :confirm-text="confirmText" @confirm="confirmIfValid()" @close="close()" :disabled="!isValid()"/>
  </div>
</template>

<script src="./ResetPassword.ts" lang="ts"></script>
<style src="./ResetPassword.scss" lang="scss" scoped></style>
