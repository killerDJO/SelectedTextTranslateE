<script setup lang="ts">
interface Props {
  text: string;
  type: 'success' | 'error';
  dismissible?: boolean;
}

withDefaults(defineProps<Props>(), {
  dismissible: true
});

defineEmits<{
  (e: 'dismiss'): void;
}>();
</script>

<template>
  <div class="alert" :class="{ success: type === 'success', error: type === 'error' }">
    {{ text }}
    <icon-button
      v-if="dismissible"
      :title="'Dismiss'"
      class="dismiss-button"
      @click="$emit('dismiss')"
    >
      <font-awesome-icon icon="xmark" class="dismiss-icon" />
    </icon-button>
  </div>
</template>

<style src="./app-alert.scss" lang="scss" scoped></style>
