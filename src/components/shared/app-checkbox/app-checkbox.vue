<script setup lang="ts">
interface Props {
  value: boolean;
  label: string;
  leftToRight?: boolean;
  disabled?: boolean;
  tabIndex?: number;
}
withDefaults(defineProps<Props>(), {
  disabled: false,
  leftToRight: false,
  tabIndex: 0
});

defineEmits<{
  'update:value': [isChecked: boolean];
}>();
</script>

<template>
  <div class="checkbox" :class="{ disabled: disabled }">
    <label>
      <span v-if="leftToRight">{{ label }}</span>
      <span class="input-wrapper"
        ><input
          type="checkbox"
          class="form-checkbox"
          :checked="value"
          :disabled="disabled"
          :tabindex="tabIndex"
          @change="event => $emit('update:value', (event.target as HTMLInputElement).checked)"
      /></span>
      <span v-if="!leftToRight">{{ label }}</span>
    </label>
  </div>
</template>

<style src="./app-checkbox.scss" lang="scss" scoped></style>
