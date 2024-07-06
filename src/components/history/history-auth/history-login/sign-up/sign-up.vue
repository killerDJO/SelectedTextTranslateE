<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { computed, reactive } from 'vue';

import { executeIfValid } from '~/utils/validation.utils';
import { useHistoryAuthStore } from '~/components/history/history-auth/history-auth.store';
import type { AuthResponse } from '~/components/history/history-auth/models/auth-response.model';
import { passwordValidators } from '~/components/history/history-auth/password.utils';

interface Props {
  actionExecutor: <TErrorCodes extends string>(
    action: () => Promise<AuthResponse<TErrorCodes>>,
    errorCodes: { [key in TErrorCodes]: string }
  ) => Promise<boolean>;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'sign-in'): void;
}>();

const historyAuth = useHistoryAuthStore();

const state = reactive({
  email: '',
  password: '',
  passwordConfirmation: ''
});
const rules = computed(() => ({
  email: {
    required: helpers.withMessage('Email must not be empty.', required),
    email: helpers.withMessage('Email is not valid.', email)
  },
  ...passwordValidators()
}));
const v$ = useVuelidate(rules, state);

async function signUpIfValid() {
  await executeIfValid(v$, () => {
    props.actionExecutor(() => historyAuth.signUp(state.email, state.password), {
      'email-already-in-use': 'User with this email is already registered.'
    });
  });
}
</script>

<template>
  <div class="content-holder" @keyup.enter="signUpIfValid()">
    <div class="form-group">
      <label>Email address</label>
      <validated-field :errors="v$.email.$errors">
        <input
          v-model="state.email"
          type="text"
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
    <div class="sign-up-controls">
      <link-button :text="'Sign In'" @click="$emit('sign-in')" />
      <app-button :text="'Sign Up'" :disabled="v$.$error" @click="signUpIfValid()" />
    </div>
  </div>
</template>

<style src="./sign-up.scss" lang="scss" scoped></style>
