import type { Ref } from 'vue';
import type { Validation } from '@vuelidate/core';

export async function executeIfValid(validator: Ref<Validation>, action: () => void) {
  const isValid = await validator.value.$validate();
  if (isValid) {
    action();
  } else {
    validator.value.$touch();
  }
}
