<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { computed, reactive, ref } from 'vue';

import { useGlobalErrorsStore } from '~/components/global-errors/global-errors.store';
import { executeIfValid } from '~/utils/execute-if-valid';
import { commonErrorMessages } from '~/components/history/history-auth/error-codes';
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';
import type { AuthResponse } from '~/components/history/history-auth/models/auth-response';
import {
  passwordValidators,
  PASSWORD_TOO_WEAK_MESSAGE
} from '~/components/history/history-auth/password-validators';

const historyAuth = useHistoryAuthStore();

const isVisible = ref(false);
const isInProgress = ref(false);
const errorMessage = ref<string | null>(null);

const state = reactive({
  oldPassword: '',
  password: '',
  passwordConfirmation: ''
});
const rules = computed(() => ({
  oldPassword: {
    required: helpers.withMessage('Old password must not be empty.', required)
  },
  ...passwordValidators()
}));
const v$ = useVuelidate(rules, state, { $autoDirty: true });

async function changePasswordIfValid() {
  await executeIfValid(v$, () => executeChangePassword(state.oldPassword, state.password));
}

async function executeChangePassword(oldPassword: string, newPassword: string) {
  const isSuccessful = await executeAuthAction(
    () => historyAuth.changePassword(oldPassword, newPassword),
    {
      'weak-password': PASSWORD_TOO_WEAK_MESSAGE,
      'wrong-password': 'Old password is wrong.'
    }
  );

  if (isSuccessful) {
    isVisible.value = false;
  }
}

async function executeAuthAction<TErrorCodes extends string>(
  action: () => Promise<AuthResponse<TErrorCodes>>,
  errorCodes: { [key in TErrorCodes]: string }
): Promise<boolean> {
  isInProgress.value = true;
  try {
    errorMessage.value = null;
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
    isVisible.value = false;
    return false;
  } finally {
    isInProgress.value = false;
  }

  return false;
}

defineExpose({
  open: () => {
    v$.value.$reset();
    Object.assign<typeof state, typeof state>(state, {
      password: '',
      oldPassword: '',
      passwordConfirmation: ''
    });
    isVisible.value = true;
  }
});
</script>

<template>
  <app-modal v-model:show="isVisible" :is-action-in-progress="isInProgress">
    <template #header><span>Change Password</span></template>
    <template #body>
      <app-alert
        v-if="errorMessage"
        class="error-alert"
        type="error"
        :text="errorMessage"
        @dismiss="errorMessage = null"
      ></app-alert>
      <div class="content-holder" @keyup.enter="changePasswordIfValid()">
        <div class="form-group">
          <label>Old Password</label>
          <validated-field :errors="v$.oldPassword.$errors">
            <password-input
              v-model:value="state.oldPassword"
              placeholder="Old Password"
              @blur="v$.oldPassword.$touch"
            />
          </validated-field>
        </div>
        <div class="form-group">
          <label>New Password</label>
          <validated-field :errors="v$.password.$errors">
            <password-input
              v-model:value="state.password"
              placeholder="New Password"
              @blur="v$.password.$touch"
            />
          </validated-field>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <validated-field :errors="v$.passwordConfirmation.$errors">
            <password-input
              v-model:value="state.passwordConfirmation"
              placeholder="Confirm Password"
              @blur="v$.passwordConfirmation.$touch"
            />
          </validated-field>
        </div>
      </div>
      <div class="change-password-footer">
        <link-button :text="'Cancel'" class="cancel" @click="isVisible = false" />
        <app-button
          :text="'Change Password'"
          :disabled="v$.$error"
          @click="changePasswordIfValid()"
        />
      </div>
      <app-loader v-if="isInProgress"></app-loader>
    </template>
  </app-modal>
</template>

<style src="./change-password.scss" lang="scss" scoped></style>
