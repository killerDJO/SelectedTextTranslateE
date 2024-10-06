<script setup lang="ts">
interface Props {
  isActive: boolean;
}
defineProps<Props>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button class="toggle-button" :class="{ active: isActive }" @click.stop="$emit('click')">
    <slot></slot>
  </button>
</template>

<style src="./toggle-button.scss" lang="scss" scoped></style>
