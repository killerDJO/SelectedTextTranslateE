<script setup lang="ts">
interface Props {
  text: string;
  tabIndex?: number;
}

withDefaults(defineProps<Props>(), {
  tabIndex: 0
});

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <a
    class="link"
    :tabindex="tabIndex"
    @click.stop="$emit('click')"
    @keyup.enter.stop="$emit('click')"
    >{{ text }}</a
  >
</template>

<style src="./link-button.scss" lang="scss" scoped></style>
