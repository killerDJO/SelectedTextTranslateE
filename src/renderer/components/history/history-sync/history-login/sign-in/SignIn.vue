<template>
  <div class="content-holder">
    <div class="login-view">
      <div class="form-group">
        <label>Email address</label>
         <validated-field :validation-message="validationResult.email">
           <input v-tab-index v-auto-focus type="email" title="" class="form-control" placeholder="Email" v-model="data.email">
         </validated-field>
      </div>
      <div class="form-group">
        <label>Password</label>
         <validated-field :validation-message="validationResult.password">
          <password :value.sync="data.password" />
         </validated-field>
      </div>
      <link-button @click="restorePassword" :text="'Forget Your Password?'" />
    </div>
    <history-login-footer :confirm-text="'Sign In'" @confirm="confirmIfValid()" @close="close()" :disabled="!isValid()" />
  </div>
</template>

<script src="./SignIn.ts" lang="ts"></script>
<style src="./SignIn.scss" lang="scss" scoped></style>
