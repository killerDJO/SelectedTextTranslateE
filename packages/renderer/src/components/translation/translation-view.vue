<script setup lang="ts">
import { onMounted } from 'vue';

import { useAppStore } from '~/app.store';

import TranslationResult from './translation-result/translation-result.vue';
import TranslationInput from './translation-input/translation-input.vue';
import { useTranslateResultStore } from './translation-result/translation-result.store';
import { useTranslationStore } from './translation.store';

const appStore = useAppStore();
const translationResultStore = useTranslateResultStore();
const translationStore = useTranslationStore();

onMounted(async () => {
  await translationStore.setup();
});
</script>

<template>
  <div v-if="appStore.hasSettings" class="translation">
    <translation-result
      v-if="
        translationResultStore.translateDescriptor &&
        (translationResultStore.translateResult || translationResultStore.isTranslationInProgress)
      "
      :default-view="translationResultStore.defaultTranslateResultView"
      :translate-result="translationResultStore.translateResult"
      :translate-descriptor="translationResultStore.translateDescriptor"
      :history-record="translationResultStore.historyRecord"
      :is-in-progress="translationResultStore.isTranslationInProgress"
      :settings="appStore.settings.views.translation.renderer"
      :languages="appStore.settings.supportedLanguages"
      @translate-suggestion="translationResultStore.translateSuggestion()"
      @force-translation="translationResultStore.forceTranslation()"
      @refresh-translation="translationResultStore.refreshTranslation()"
      @translate-text="request => translationResultStore.translateText(request)"
      @change-language="translationResultStore.changeLanguage()"
      @play-text="translationResultStore.playCurrentSentence()"
      @search="translationResultStore.search()"
      @archive="translationResultStore.archive()"
      @set-starred-status="isStarred => translationResultStore.setStarredStatus(isStarred)"
      @update-tags="tags => translationResultStore.updateTags(tags)"
    />
    <template v-if="translationStore.showInput || translationStore.nonTextTranslation">
      <app-alert
        v-if="translationStore.nonTextTranslation"
        :dismissible="false"
        type="error"
        text="No text data selected"
        class="non-text-translation"
      ></app-alert>
      <translation-input
        :languages="appStore.settings.supportedLanguages"
        :language-settings="appStore.settings.language"
        @translate-text="request => translationStore.translateText(request)"
        @play-text="request => translationResultStore.playText(request)"
      />
    </template>
  </div>
</template>

<style src="./translation-view.scss" lang="scss" scoped></style>
