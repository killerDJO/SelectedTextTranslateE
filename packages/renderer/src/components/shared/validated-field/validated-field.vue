<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core';
import { computed } from 'vue';

interface Props {
  errors: (ErrorObject | string)[];
  hideMessage?: boolean;
}
const props = defineProps<Props>();

const errorMessage = computed(() => {
  return props.errors.map(error => (typeof error === 'string' ? error : error.$message)).join('\n');
});
</script>

<template>
  <div class="validated-field" :class="{ error: !!errors.length }">
    <div class="content">
      <slot />
    </div>
    <div v-if="!!errors.length && !hideMessage" class="error-message">
      <font-awesome-icon class="error-icon" icon="triangle-exclamation" size="sm" />{{
        errorMessage
      }}
    </div>
  </div>
</template>

<style src="./validated-field.scss" lang="scss" scoped></style>
