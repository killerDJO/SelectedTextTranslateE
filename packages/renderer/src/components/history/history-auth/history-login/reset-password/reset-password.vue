<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { computed, reactive, ref, watch } from 'vue';

import { executeIfValid } from '~/utils/execute-if-valid';
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';
import type { AuthResponse } from '~/components/history/history-auth/models/auth-response';
import {
  passwordValidators,
  PASSWORD_TOO_WEAK_MESSAGE
} from '~/components/history/history-auth/password-validators';

enum ResetPasswordStep {
  Email = 'email',
  Token = 'token',
  Password = 'password'
}

interface Props {
  actionExecutor: <TErrorCodes extends string>(
    action: () => Promise<AuthResponse<TErrorCodes>>,
    errorCodes: { [key in TErrorCodes]: string }
  ) => Promise<boolean>;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'sign-in', email?: string): void;
  (e: 'show-message', message: string): void;
}>();

const historyAuth = useHistoryAuthStore();

const step = ref<ResetPasswordStep>(ResetPasswordStep.Email);

const emailStepState = reactive({
  email: ''
});
const emailStepRules = computed(() => ({
  email: {
    required: helpers.withMessage('Email must not be empty.', required),
    email: helpers.withMessage('Email is not valid.', email)
  }
}));
const emailValidator$ = useVuelidate(emailStepRules, emailStepState);

const tokenStepState = reactive({
  token: ''
});
const tokenStepRules = computed(() => ({
  token: {
    required: helpers.withMessage('Confirmation Token must not be empty.', required)
  }
}));
const tokenValidator$ = useVuelidate(tokenStepRules, tokenStepState);

const passwordStepState = reactive({
  password: '',
  passwordConfirmation: ''
});
const passwordStepRules = computed(() => ({
  ...passwordValidators()
}));
const passwordValidator$ = useVuelidate(passwordStepRules, passwordStepState);

const confirmText = computed(() => {
  const confirmTextMap: { [key in ResetPasswordStep]: string } = {
    email: 'Send Email',
    token: 'Verify Token',
    password: 'Change Password'
  };

  return confirmTextMap[step.value];
});

watch(step, () => {
  if (step.value === 'email') {
    tokenStepState.token = '';
    passwordStepState.password = '';
    passwordStepState.passwordConfirmation = '';
    tokenValidator$.value.$reset();
    passwordValidator$.value.$reset();
  }

  if (step.value === 'token') {
    passwordStepState.password = '';
    passwordStepState.passwordConfirmation = '';
    passwordValidator$.value.$reset();
  }
});

async function sendPasswordResetToken(email: string) {
  const isSuccessful = await props.actionExecutor(() => historyAuth.sendPasswordResetToken(email), {
    'invalid-email': 'Email is invalid.',
    'user-not-found': 'User with this email is not found.',
    'too-many-requests': 'Too many requests for this email. Try again later.'
  });

  if (isSuccessful) {
    $emit('show-message', 'Password reset code has been sent. Please check your email.');
    step.value = ResetPasswordStep.Token;
  }
}

async function verifyPasswordResetToken(token: string) {
  const isSuccessful = await props.actionExecutor(
    () => historyAuth.verifyPasswordResetToken(token),
    {
      'invalid-token': 'Token has expired.',
      'expired-token': 'Token is invalid.'
    }
  );

  if (isSuccessful) {
    step.value = ResetPasswordStep.Password;
  }
}

async function confirmPasswordReset(password: string, token: string) {
  const isSuccessful = await props.actionExecutor(
    () => historyAuth.confirmPasswordReset(token, password),
    {
      'expired-action-code': 'Token has expired. Repeat the password reset procedure.',
      'invalid-action-code': 'Token is invalid. Repeat the password reset procedure.',
      'weak-password': PASSWORD_TOO_WEAK_MESSAGE
    }
  );

  if (isSuccessful) {
    $emit('show-message', 'Password has been reset. You can now sign in using your new password.');
    $emit('sign-in', emailStepState.email);
  }
}

async function confirmIfValid() {
  if (step.value === ResetPasswordStep.Email) {
    await executeIfValid(emailValidator$, () => sendPasswordResetToken(emailStepState.email));
  } else if (step.value === ResetPasswordStep.Token) {
    await executeIfValid(tokenValidator$, () => verifyPasswordResetToken(tokenStepState.token));
  } else if (step.value === ResetPasswordStep.Password) {
    await executeIfValid(passwordValidator$, () =>
      confirmPasswordReset(passwordStepState.password, tokenStepState.token)
    );
  }
}

function isStepInvalid() {
  if (step.value === ResetPasswordStep.Email) {
    return emailValidator$.value.$error;
  } else if (step.value === ResetPasswordStep.Token) {
    return tokenValidator$.value.$error;
  } else if (step.value === ResetPasswordStep.Password) {
    return passwordValidator$.value.$error;
  }
}
</script>

<template>
  <div class="content-holder" @keyup.enter="confirmIfValid()">
    <div class="form-group">
      <label>Email address</label>
      <validated-field :errors="emailValidator$.email.$errors">
        <input
          v-model="emailStepState.email"
          type="text"
          class="form-control"
          placeholder="Email"
          :disabled="step !== ResetPasswordStep.Email"
          @blur="emailValidator$.email.$touch"
        />
      </validated-field>
      <div v-if="step !== ResetPasswordStep.Email" class="email-actions">
        <link-button :text="'Change Email'" @click="step = ResetPasswordStep.Email" />
        <link-button
          v-if="step === ResetPasswordStep.Token"
          :text="'Resend Token'"
          class="resend-token-button"
          @click="sendPasswordResetToken(emailStepState.email)"
        />
      </div>
    </div>
    <div v-if="step === ResetPasswordStep.Token" class="form-group">
      <label>Reset Code</label>
      <validated-field :errors="tokenValidator$.token.$errors">
        <input
          v-model="tokenStepState.token"
          type="text"
          class="form-control"
          placeholder="Reset Code"
          @blur="tokenValidator$.token.$touch"
        />
      </validated-field>
    </div>
    <div v-if="step === ResetPasswordStep.Password">
      <div class="form-group">
        <label>Password</label>
        <validated-field :errors="passwordValidator$.password.$errors">
          <password-input
            v-model:value="passwordStepState.password"
            placeholder="Password"
            @blur="passwordValidator$.password.$touch"
          />
        </validated-field>
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <validated-field :errors="passwordValidator$.passwordConfirmation.$errors">
          <password-input
            v-model:value="passwordStepState.passwordConfirmation"
            placeholder="Confirm Password"
            @blur="passwordValidator$.passwordConfirmation.$touch"
          />
        </validated-field>
      </div>
    </div>
    <div class="reset-password-controls">
      <link-button :text="'Sign In'" @click="$emit('sign-in')" />
      <app-button :text="confirmText" :disabled="isStepInvalid()" @click="confirmIfValid()" />
    </div>
  </div>
</template>

<style src="./reset-password.scss" lang="scss" scoped></style>
