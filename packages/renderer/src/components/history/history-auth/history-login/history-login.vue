<script setup lang="ts">
import { ref } from 'vue';

import type { AuthResponse } from '~/components/history/history-auth/models/auth-response.model';
import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';
import { commonErrorMessages } from '~/components/history/history-auth/error-codes';

import SignIn from './sign-in/sign-in.vue';
import SignUp from './sign-up/sign-up.vue';
import ResetPassword from './reset-password/reset-password.vue';

enum View {
  SignIn = 'sign-in',
  SignUp = 'sign-up',
  ResetPassword = 'reset-password'
}

const currentView = ref<View>(View.SignIn);
const signInEmail = ref<string>('');
const isLoginActionInProgress = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

async function executeLoginAction<TErrorCodes extends string>(
  action: () => Promise<AuthResponse<TErrorCodes>>,
  errorCodes: { [key in TErrorCodes]: string }
): Promise<boolean> {
  isLoginActionInProgress.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    const authResponse = await action();
    if (authResponse.isSuccessful) {
      return true;
    } else if (authResponse.errorCode) {
      errorMessage.value =
        errorCodes[authResponse.errorCode as TErrorCodes] ??
        commonErrorMessages[authResponse.errorCode] ??
        `Unknown error: ${authResponse.errorCode}`;
      return false;
    }
  } catch (e) {
    useGlobalErrorsStore().addError('Unknown error', e);
    return false;
  } finally {
    isLoginActionInProgress.value = false;
  }

  return false;
}

function changeView(view: View, resetEmail?: string) {
  signInEmail.value = resetEmail ?? '';
  currentView.value = view;
}
</script>

<template>
  <div class="login-container">
    <div class="login-header">
      <template v-if="currentView === View.SignIn">Sign In to sync history across devices</template>
      <template v-if="currentView === View.SignUp">Register a new account</template>
      <template v-if="currentView === View.ResetPassword">Password reset</template>
    </div>

    <app-alert
      v-if="errorMessage"
      class="alert"
      type="error"
      :text="errorMessage"
      @dismiss="errorMessage = null"
    ></app-alert>
    <app-alert
      v-if="successMessage"
      class="alert"
      type="success"
      :text="successMessage"
      @dismiss="successMessage = null"
    ></app-alert>
    <div class="login-content">
      <sign-in
        v-if="currentView === View.SignIn"
        :action-executor="executeLoginAction"
        :email="signInEmail"
        @sign-up="changeView(View.SignUp)"
        @restore-password="currentView = View.ResetPassword"
      />
      <sign-up
        v-if="currentView === View.SignUp"
        :action-executor="executeLoginAction"
        @sign-in="changeView(View.SignIn)"
      />
      <reset-password
        v-if="currentView === 'reset-password'"
        :action-executor="executeLoginAction"
        @show-message="message => (successMessage = message)"
        @sign-in="email => changeView(View.SignIn, email)"
      />
      <app-loader v-show="isLoginActionInProgress"></app-loader>
    </div>
  </div>
</template>

<style src="./history-login.scss" lang="scss" scoped></style>
