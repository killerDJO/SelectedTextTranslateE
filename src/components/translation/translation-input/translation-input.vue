<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

import type {
  PlayTextRequest,
  TranslateRequest
} from '~/components/translation/models/requests.model';
import type { SelectedLanguages } from '~/components/shared/language-selector/language-selector.vue';
import { TranslationSettings } from '~/host/models/settings.model';

interface Props {
  translationSettings: TranslationSettings;
  languages: Map<string, string>;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'translate-text', request: TranslateRequest): void;
  (e: 'play-text', request: PlayTextRequest): void;
}>();

const selectedLanguages = reactive({
  sourceLanguage: props.translationSettings.sourceLanguage,
  targetLanguage: props.translationSettings.targetLanguage
});
const text = ref('');

watch(
  () => props.translationSettings,
  () => {
    selectedLanguages.sourceLanguage = props.translationSettings.sourceLanguage;
    selectedLanguages.targetLanguage = props.translationSettings.targetLanguage;
  },
  { deep: true }
);

function updateLanguageSettings(languageSettings: SelectedLanguages): void {
  selectedLanguages.sourceLanguage = languageSettings.sourceLanguage!;
  selectedLanguages.targetLanguage = languageSettings.targetLanguage!;
}

function translate(): void {
  if (text.value) {
    const request: TranslateRequest = {
      sentence: text.value,
      isForcedTranslation: false,
      sourceLanguage: selectedLanguages.sourceLanguage,
      targetLanguage: selectedLanguages.targetLanguage
    };
    $emit('translate-text', request);
  }
}

function playText(): void {
  if (text.value) {
    const request: PlayTextRequest = {
      text: text.value,
      language: selectedLanguages.sourceLanguage
    };
    $emit('play-text', request);
  }
}
</script>

<template>
  <div class="translation-input form-group">
    <label>Input text and press Enter to translate</label>
    <div class="input-holder">
      <input
        v-model="text"
        v-auto-focus
        class="form-control"
        type="text"
        autofocus
        @keydown.enter="translate()"
      />
      <icon-button :title="'Play'" class="play-icon-holder" @click="playText()">
        <play-icon class="play-icon"></play-icon>
      </icon-button>
    </div>
    <language-selector
      class="input-language-settings"
      :languages="selectedLanguages"
      :all-languages="props.languages"
      @languages-updated="updateLanguageSettings($event)"
    />
  </div>
</template>

<style src="./translation-input.scss" lang="scss" scoped></style>
