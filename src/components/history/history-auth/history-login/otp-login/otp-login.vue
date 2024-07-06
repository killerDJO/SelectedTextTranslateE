<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { computed, reactive, ref, watch } from 'vue';

import { executeIfValid } from '~/utils/validation.utils';
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';
import type { AuthResponse } from '~/components/history/history-auth/models/auth-response.model';

enum LoginStep {
  Email = 'email',
  Code = 'code'
}

interface Props {
  actionExecutor: <TErrorCodes extends string>(
    action: () => Promise<AuthResponse<TErrorCodes>>,
    errorCodes: { [key in TErrorCodes]: string }
  ) => Promise<boolean>;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'show-message', message: string | null): void;
}>();

const historyAuth = useHistoryAuthStore();

const step = ref<LoginStep>(LoginStep.Email);

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

const codeStepState = reactive({
  code: ''
});
const codeStepRules = computed(() => ({
  code: {
    required: helpers.withMessage('Login code must not be empty.', required)
  }
}));
const codeValidator$ = useVuelidate(codeStepRules, codeStepState);

const confirmText = computed(() => {
  const confirmTextMap: { [key in LoginStep]: string } = {
    email: 'Send Email',
    code: 'Verify Code'
  };

  return confirmTextMap[step.value];
});

watch(step, () => {
  if (step.value === LoginStep.Email) {
    codeStepState.code = '';
    codeValidator$.value.$reset();
  }
});

async function sendOTPEmail(email: string) {
  const isSuccessful = await props.actionExecutor(() => historyAuth.signInWithOTP(email), {
    'too-many-requests': 'Too many requests. Please try again later.'
  });

  if (isSuccessful) {
    $emit('show-message', 'Login code has been sent. Please check your email.');
    step.value = LoginStep.Code;
  }
}

async function verifyLoginCode(email: string, code: string) {
  await props.actionExecutor(() => historyAuth.verifyOTPAndLogin(email, code), {
    'invalid-otp': 'Code has expired or invalid.'
  });
}

async function confirmIfValid() {
  if (step.value === LoginStep.Email) {
    await executeIfValid(emailValidator$, () => sendOTPEmail(emailStepState.email));
  } else if (step.value === LoginStep.Code) {
    await executeIfValid(codeValidator$, () =>
      verifyLoginCode(emailStepState.email, codeStepState.code)
    );
  }
}

function isStepInvalid() {
  if (step.value === LoginStep.Email) {
    return emailValidator$.value.$error;
  } else if (step.value === LoginStep.Code) {
    return codeValidator$.value.$error;
  }
}

function changeEmail() {
  step.value = LoginStep.Email;
  $emit('show-message', null);
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
          :disabled="step !== LoginStep.Email"
          @blur="emailValidator$.email.$touch"
        />
      </validated-field>
      <div v-if="step !== LoginStep.Email" class="email-actions">
        <link-button :text="'Change Email'" @click="changeEmail" />
        <link-button
          v-if="step === LoginStep.Code"
          :text="'Resend Code'"
          @click="sendOTPEmail(emailStepState.email)"
        />
      </div>
    </div>
    <div v-if="step === LoginStep.Code" class="form-group">
      <label>Login code</label>
      <validated-field :errors="codeValidator$.code.$errors">
        <input
          v-model="codeStepState.code"
          type="text"
          class="form-control"
          placeholder="Login code"
          @blur="codeValidator$.code.$touch"
        />
      </validated-field>
    </div>
    <div class="/otp-login-controls">
      <app-button :text="confirmText" :disabled="isStepInvalid()" @click="confirmIfValid()" />
    </div>
  </div>
</template>

<style src="./otp-login.scss" lang="scss" scoped></style>
