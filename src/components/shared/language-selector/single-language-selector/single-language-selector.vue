<script setup lang="ts">
import type { LanguageItem } from '../language-selector.vue';

interface Props {
  selectedLanguage?: string;
  allLanguages: ReadonlyArray<LanguageItem>;
}

defineProps<Props>();

const NOT_SELECTED_VALUE = '-';

const $emit = defineEmits<{
  'update:selectedLanguage': [language?: string];
}>();

function onLanguageSelected(element: HTMLSelectElement) {
  $emit(
    'update:selectedLanguage',
    element.value === NOT_SELECTED_VALUE ? undefined : element.value
  );
}
</script>

<template>
  <select
    class="form-select"
    :value="selectedLanguage ?? NOT_SELECTED_VALUE"
    @change="onLanguageSelected($event.target as HTMLSelectElement)"
  >
    <option
      v-for="language in allLanguages"
      :key="language.value ?? NOT_SELECTED_VALUE"
      :value="language.value ?? NOT_SELECTED_VALUE"
      class="language-option"
    >
      {{ language.name }}
    </option>
  </select>
</template>

<style src="./single-language-selector.scss" lang="scss" scoped></style>
