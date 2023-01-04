<script setup lang="ts">
interface Props {
  text: string;
  isActive: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button class="toggle-button" :class="{ active: isActive }" @click.stop="$emit('click')">
    {{ text }}
  </button>
</template>

<style src="./toggle-button.scss" lang="scss" scoped></style>
