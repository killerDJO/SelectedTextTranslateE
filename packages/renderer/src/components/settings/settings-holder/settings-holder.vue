<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<template>
  <div class="settings-holder">
    <div class="settings-title">{{ title }}</div>
    <div class="holder">
      <slot />
    </div>
  </div>
</template>

<style src="./settings-holder.scss" lang="scss" scoped></style>
