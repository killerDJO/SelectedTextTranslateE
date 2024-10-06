<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  message: string;
  error: Error;
  dismissible?: boolean;
}
withDefaults(defineProps<Props>(), { dismissible: true });

defineEmits<{
  dismiss: [];
}>();

const isExpanded = ref(false);

function getFriendlyMessage(message: string, error: Error): string {
  const errorText = (error?.message ?? error)?.toString() ?? '';
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
    <div v-if="isExpanded && error" class="error-details">
      <div v-if="error.message">
        <label>Message:</label> <span class="details">{{ error.message }}</span>
      </div>
      <div v-if="error.stack">
        <label>Stack:</label> <span class="details">{{ error.stack }}</span>
      </div>
    </div>
  </div>
</template>

<style src="./app-error.scss" lang="scss" scoped></style>
