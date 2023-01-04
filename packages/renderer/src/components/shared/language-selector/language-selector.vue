<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import SingleLanguageSelector from './single-language-selector/single-language-selector.vue';

export interface SelectedLanguages {
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface LanguageItem {
  value: string | undefined;
  name: string;
}

interface Props {
  languages: SelectedLanguages;
  allLanguages: Map<string, string>;
  allowUnselect?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  allowUnselect: false
});

const $emit = defineEmits<{
  (e: 'languages-updated', languages: SelectedLanguages): void;
}>();

const selectedLanguages = reactive({ ...props.languages });

watch(selectedLanguages, updatedLanguages => $emit('languages-updated', updatedLanguages));
watch(
  () => props.languages,
  () => {
    selectedLanguages.sourceLanguage = props.languages.sourceLanguage;
    selectedLanguages.targetLanguage = props.languages.targetLanguage;
  },
  { deep: true }
);

function switchLanguages(): void {
  const originalSourceLanguage = selectedLanguages.sourceLanguage;
  selectedLanguages.sourceLanguage = selectedLanguages.targetLanguage;
  selectedLanguages.targetLanguage = originalSourceLanguage;
}

const sourceLanguages = computed(() => {
  return filterLanguages(selectedLanguages.targetLanguage);
});

const targetLanguages = computed(() => {
  return filterLanguages(selectedLanguages.sourceLanguage);
});

function filterLanguages(code?: string): ReadonlyArray<LanguageItem> {
  const languageItems: LanguageItem[] = Array.from(props.allLanguages).map(([code, name]) => ({
    value: code,
    name: name
  }));

  if (props.allowUnselect) {
    languageItems.unshift({
      value: undefined,
      name: ''
    });
  }

  return languageItems.filter(item => !code || item.value !== code);
}
</script>

<template>
  <div class="language-input settings-item">
    <single-language-selector
      v-model:selected-language="selectedLanguages.sourceLanguage"
      :all-languages="sourceLanguages"
    />
    <div class="separator">
      <icon-button :title="'Switch'" @click="switchLanguages"
        ><font-awesome-icon icon="arrow-right-arrow-left" size="sm"
      /></icon-button>
    </div>
    <single-language-selector
      v-model:selected-language="selectedLanguages.targetLanguage"
      :all-languages="targetLanguages"
    />
  </div>
</template>

<style src="./language-selector.scss" lang="scss" scoped></style>
