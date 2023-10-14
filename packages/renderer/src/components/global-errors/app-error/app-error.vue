<script setup lang="ts">
import { ref } from 'vue';

import { ensureErrorType } from '~/utils/ensure-error-type';

interface Props {
  message: string;
  error: unknown;
  dismissible?: boolean;
}
withDefaults(defineProps<Props>(), { dismissible: true });

defineEmits<{
  (e: 'dismiss'): void;
}>();

const isExpanded = ref(false);

function getFriendlyMessage(message: string, error: unknown): string {
  const errorType = ensureErrorType(error);
  const errorText = (errorType?.message ?? errorType)?.toString() ?? '';
  if (errorText.includes('ENOTFOUND') || errorText.includes('timeout')) {
    return `${message} Network error.`;
  }

  return message;
}
</script>

<template>
  <div class="app-error">
    <div class="error-header">
      <div class="error-message" @click="isExpanded = !isExpanded">
        {{ getFriendlyMessage(message, error) }}
      </div>

      <icon-button v-if="dismissible" title="Dismiss" @click="$emit('dismiss')"
        ><font-awesome-icon icon="xmark" class="icon-cancel"
      /></icon-button>
    </div>
    <span v-if="isExpanded && error" class="error-details">{{ error }}</span>
  </div>
</template>

<style src="./app-error.scss" lang="scss" scoped></style>
