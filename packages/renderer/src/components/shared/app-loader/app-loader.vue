<script setup lang="ts">
interface Props {
  large?: boolean;
}

defineProps<Props>();
</script>
<template>
  <div class="loading-overlay" :class="{ large: large }"></div>
</template>

<style src="./app-loader.scss" lang="scss" scoped></style>
