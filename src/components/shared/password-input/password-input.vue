<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  value: string;
  placeholder?: string;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update:value', value: string): void;
  (e: 'blur'): void;
}>();

const isPasswordVisible = ref(false);

const value$ = computed({
  get: () => props.value,
  set: value => $emit('update:value', value)
});
</script>

<template>
  <div class="password">
    <input
      v-show="!isPasswordVisible"
      v-model="value$"
      type="password"
      class="form-control"
      :placeholder="placeholder"
      @blur="$emit('blur')"
    />
    <input
      v-show="isPasswordVisible"
      v-model="value$"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      @blur="$emit('blur')"
    />
    <icon-button
      :title="!isPasswordVisible ? 'Reveal Password' : 'Hide Password'"
      class="reveal-icon"
      @click="isPasswordVisible = !isPasswordVisible"
    >
      <font-awesome-icon :icon="!isPasswordVisible ? 'eye' : 'eye-slash'" size="sm" />
    </icon-button>
  </div>
</template>

<style src="./password-input.scss" lang="scss" scoped></style>
