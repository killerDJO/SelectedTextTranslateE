<script setup lang="ts">
import { onMounted } from 'vue';

import { useAppStore } from '~/app.store';

import TranslationResult from './translation-result/translation-result.vue';
import TranslationInput from './translation-input/translation-input.vue';
import { useTranslateResultStore } from './translation-result/translation-result.store';
import { useTranslationStore } from './translation.store';

const app = useAppStore();
const translateResult = useTranslateResultStore();
const translation = useTranslationStore();

onMounted(async () => {
  await translation.setup();
});
</script>

<template>
  <div class="translation">
    <translation-result
      v-if="
        translateResult.translateDescriptor &&
        (translateResult.translateResult || translateResult.isTranslationInProgress)
      "
      :default-view="translateResult.defaultTranslateResultView"
      :translate-result="translateResult.translateResult"
      :translate-descriptor="translateResult.translateDescriptor"
      :history-record="translateResult.historyRecord"
      :is-in-progress="translateResult.isTranslationInProgress"
      :settings="app.settings.views.translation.renderer"
      :languages="app.settings.supportedLanguages"
      @translate-suggestion="translateResult.translateSuggestion()"
      @force-translation="translateResult.forceTranslation()"
      @refresh-translation="translateResult.refreshTranslation()"
      @translate-text="request => translateResult.translateText(request)"
      @change-language="translateResult.changeLanguage()"
      @play-text="translateResult.playCurrentSentence()"
      @search="translateResult.search()"
      @archive="translateResult.archive()"
      @set-starred-status="isStarred => translateResult.setStarredStatus(isStarred)"
      @update-tags="tags => translateResult.updateTags(tags)"
    />
    <template v-if="translation.showInput || translation.nonTextTranslation">
      <app-alert
        v-if="translation.nonTextTranslation"
        :dismissible="false"
        type="error"
        text="No text data selected"
        class="non-text-translation"
      ></app-alert>
      <translation-input
        :languages="app.settings.supportedLanguages"
        :language-settings="app.settings.language"
        @translate-text="request => translation.translateText(request)"
        @play-text="request => translateResult.playText(request)"
      />
    </template>
  </div>
</template>

<style src="./translation-view.scss" lang="scss" scoped></style>
