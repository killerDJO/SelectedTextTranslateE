<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { helpers, required, email as emailValidator } from '@vuelidate/validators';
import { computed, reactive } from 'vue';

import { executeIfValid } from '~/utils/validation.utils';
import type { AuthResponse } from '~/components/history/history-auth/models/auth-response.model';
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';

interface Props {
  actionExecutor: <TErrorCodes extends string>(
    action: () => Promise<AuthResponse<TErrorCodes>>,
    errorCodes: { [key in TErrorCodes]: string }
  ) => Promise<boolean>;
  email?: string;
}

const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'restore-password'): void;
  (e: 'sign-up'): void;
}>();

const historyAuth = useHistoryAuthStore();

const state = reactive({
  email: props.email ?? '',
  password: ''
});

const rules = computed(() => ({
  email: {
    required: helpers.withMessage('Email must not be empty.', required),
    email: helpers.withMessage('Email is not valid.', emailValidator)
  },
  password: {
    required: helpers.withMessage('Password must not be empty.', required)
  }
}));

const v$ = useVuelidate(rules, state);

async function signInIfValid() {
  await executeIfValid(v$, () => {
    props.actionExecutor(() => historyAuth.signIn(state.email, state.password), {
      'invalid-email': 'Email is invalid.',
      'invalid-password': 'Password is invalid.',
      'user-not-found': 'User with this email is not found.'
    });
  });
}
</script>

<template>
  <div class="content-holder" @keyup.enter="signInIfValid()">
    <div class="form-group">
      <label>Email address</label>
      <validated-field :errors="v$.email.$errors">
        <input
          v-model="state.email"
          type="text"
          title=""
          class="form-control"
          placeholder="Email"
          @blur="v$.email.$touch"
        />
      </validated-field>
    </div>
    <div class="form-group">
      <label>Password</label>
      <validated-field :errors="v$.password.$errors">
        <password-input
          v-model:value="state.password"
          placeholder="Password"
          @blur="v$.password.$touch"
        />
      </validated-field>
    </div>
    <div class="sign-in-controls">
      <link-button :text="'Forgot Your Password?'" @click="$emit('restore-password')" />
      <div class="sign-in-buttons">
        <app-button :text="'Sign Up'" :primary="false" @click="$emit('sign-up')" />
        <app-button :text="'Sign In'" :disabled="v$.$error" @click="signInIfValid()" />
      </div>
    </div>
  </div>
</template>

<style src="./sign-in.scss" lang="scss" scoped></style>
