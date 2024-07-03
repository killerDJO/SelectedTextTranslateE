<script setup lang="ts">
interface Props {
  text?: string;
  icon?: string;
  disabled?: boolean;
  primary?: boolean;
}
withDefaults(defineProps<Props>(), {
  disabled: false,
  text: '',
  icon: undefined,
  primary: true
});

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    :tabindex="disabled ? -1 : 0"
    class="app-button"
    :class="{ primary: primary }"
    :disabled="disabled"
    @click.stop="$emit('click')"
  >
    <span v-if="icon" class="icon-holder"
      ><font-awesome-icon :icon="icon" size="sm" class="button-icon"
    /></span>
    {{ text }}
  </button>
</template>

<style src="./app-button.scss" lang="scss" scoped></style>
