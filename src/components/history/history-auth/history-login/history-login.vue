<script setup lang="ts">
import { ref } from 'vue';

import type { AuthResponse } from '~/components/history/history-auth/models/auth-response.model';
import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';

import OptLogin from './otp-login/otp-login.vue';

enum View {
  OTPLogin = 'otp-login'
}

const currentView = ref<View>(View.OTPLogin);
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
        `Authentication error: ${authResponse.errorCode}`;
      return false;
    }
  } catch (e) {
    useGlobalErrorsStore().addError('Authentication error', e);
    return false;
  } finally {
    isLoginActionInProgress.value = false;
  }

  return false;
}
</script>

<template>
  <div class="login-container">
    <div class="login-header">
      <template v-if="currentView === View.OTPLogin"
        >Sign In to sync history across devices</template
      >
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
      <opt-login
        v-if="currentView === View.OTPLogin"
        :action-executor="executeLoginAction"
        @show-message="message => (successMessage = message)"
      />
      <app-loader v-show="isLoginActionInProgress"></app-loader>
    </div>
  </div>
</template>

<style src="./history-login.scss" lang="scss" scoped></style>
