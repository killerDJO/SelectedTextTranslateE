<script setup lang="ts">
interface Props {
  title: string;
  disabled?: boolean;
  tabIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  tabIndex: 0
});

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <span
    :tabindex="!props.disabled ? tabIndex : -1"
    class="icon-wrapper"
    :class="{ disabled: disabled }"
    :title="title"
    @click.stop.prevent="$emit('click')"
    @keyup.enter.stop.prevent="$emit('click')"
  >
    <slot />
  </span>
</template>

<style src="./icon-button.scss" lang="scss" scoped></style>
