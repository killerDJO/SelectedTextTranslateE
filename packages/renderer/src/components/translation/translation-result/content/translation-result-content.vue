<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import type { Tag, TranslateResultRendererSettings } from '@selected-text-translate/common';

import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type {
  TranslateDescriptor,
  TranslateResult
} from '~/components/translation/models/translation.model';
import { hotkeysRegistry } from '~/services/hotkeys-registry.service';
import { TranslateResultViews } from '~/components/translation/models/translate-result-views.enum';
import TagsEditor from '~/components/history/tags-editor/tags-editor.vue';

import TranslationResultContentCategory from './category/translation-result-content-category.vue';
import TranslationResultDefinitionCategory from './definitions/translation-result-definition-category.vue';
import TranslationResultStatistic from './statistic/translation-result-statistic.vue';

interface Props {
  translateDescriptor: TranslateDescriptor;
  translateResult: TranslateResult;
  historyRecord?: HistoryRecord;
  settings: TranslateResultRendererSettings;
  defaultView: TranslateResultViews;
  languages: Map<string, string>;
  isEmbedded: boolean;
}
const props = defineProps<Props>();

defineEmits<{
  (e: 'change-language'): void;
  (e: 'search'): void;
  (e: 'translate', text: string): void;
  (e: 'hard-delete'): void;
  (e: 'update-tags', tags: Tag[]): void;
}>();

const showTags = ref(false);
const currentView = ref(TranslateResultViews.Translation);
const tagsEditorInstance = ref<InstanceType<typeof TagsEditor> | null>(null);

const hasCategories = computed(() => !!props.translateResult.categories.length);
const similarWords = computed(() => props.translateResult.sentence.similarWords ?? []);
const hasDefinitions = computed(
  () => !!props.translateResult.definitions.length || !!similarWords.value.length
);
const languageSuggestion = computed(() => props.translateResult.sentence.languageSuggestion);
const hasLanguageSuggestion = computed(
  () =>
    !!languageSuggestion.value &&
    languageSuggestion.value !== props.translateDescriptor.sourceLanguage
);
const toggleTagsButtonText = computed(() => {
  if (showTags.value) {
    return 'Hide Tags';
  }

  const tagsNumber = (props.historyRecord?.tags ?? []).length;
  if (tagsNumber === 0) {
    return 'No Tags';
  }

  return `${tagsNumber} Tag${tagsNumber > 1 ? 's' : ''}`;
});

onMounted(async () => {
  initializeCurrentView();
});

watch(
  () => props.settings,
  () => {
    const HOTKEYS_NAMESPACE = 'translate-result-content';
    hotkeysRegistry.unregisterHotkeys(HOTKEYS_NAMESPACE);

    hotkeysRegistry.registerHotkeys(
      HOTKEYS_NAMESPACE,
      props.settings.toggleDefinitionHotkey,
      () => {
        if (currentView.value === TranslateResultViews.Definition && hasCategories) {
          currentView.value = TranslateResultViews.Translation;
        } else if (hasDefinitions.value) {
          currentView.value = TranslateResultViews.Definition;
        }
      }
    );
    hotkeysRegistry.registerHotkeys(HOTKEYS_NAMESPACE, props.settings.toggleTagsHotkey, () => {
      showTags.value = !showTags.value;
    });
    hotkeysRegistry.registerHotkeys(HOTKEYS_NAMESPACE, props.settings.addTagHotkey, async () => {
      showTags.value = true;
      await nextTick();
      tagsEditorInstance.value?.openEditor();
    });
  },
  { immediate: true }
);

watch(
  () => props.defaultView,
  () => {
    initializeCurrentView();
  }
);

function initializeCurrentView(): void {
  if (
    !hasCategories.value &&
    hasDefinitions.value &&
    props.defaultView === TranslateResultViews.Translation
  ) {
    currentView.value = TranslateResultViews.Definition;
  } else if (!hasDefinitions.value && props.defaultView === TranslateResultViews.Definition) {
    currentView.value = TranslateResultViews.Translation;
  } else {
    currentView.value = props.defaultView;
  }
}
</script>

<template>
  <div class="content" :class="{ 'is-embedded': isEmbedded }">
    <div class="actions" :class="{ 'tags-visible': showTags }">
      <link-button
        v-if="languageSuggestion && hasLanguageSuggestion"
        :text="'From ' + languages.get(languageSuggestion)"
        class="action"
        @click="$emit('change-language')"
      />
      <link-button
        v-if="currentView !== TranslateResultViews.Translation && hasCategories"
        :text="'Translations'"
        class="action"
        @click="currentView = TranslateResultViews.Translation"
      />
      <link-button
        v-if="currentView !== TranslateResultViews.Definition && hasDefinitions"
        :text="'Definitions'"
        class="action"
        @click="currentView = TranslateResultViews.Definition"
      />
      <link-button
        v-if="historyRecord"
        :text="toggleTagsButtonText"
        class="action"
        @click="showTags = !showTags"
      />
      <link-button :text="'Search'" class="action" @click="$emit('search')" />
      <link-button
        v-if="historyRecord && currentView !== TranslateResultViews.Statistic"
        :text="`${
          historyRecord.translationsNumber === 1
            ? '1 time'
            : `${historyRecord.translationsNumber} times`
        }`"
        class="action"
        @click="currentView = TranslateResultViews.Statistic"
      />
      <span v-if="!historyRecord" class="action not-synced-status">Not Synced</span>
    </div>
    <div v-if="showTags && historyRecord" class="tags">
      <tags-editor
        ref="tagsEditorInstance"
        :tags="historyRecord.tags ?? []"
        :compact-view="true"
        @update-tags="tags => $emit('update-tags', tags)"
      />
    </div>
    <div
      v-if="currentView === TranslateResultViews.Definition && similarWords.length > 0"
      class="similar-words"
    >
      <span class="similar-words-label">similar - </span>
      <span v-for="(similarWord, index) in similarWords" :key="similarWord">
        <span class="similar-word" @click="$emit('translate', similarWord)">{{ similarWord }}</span
        >{{ index !== similarWords.length - 1 ? ', ' : '' }}
      </span>
    </div>
    <div v-if="currentView === TranslateResultViews.Translation">
      <translation-result-content-category
        v-for="category in translateResult.categories"
        :key="category.baseForm + category.partOfSpeech"
        :category="category"
        :settings="settings"
        @translate="$emit('translate', $event)"
      />
    </div>
    <div v-if="currentView === TranslateResultViews.Definition">
      <translation-result-definition-category
        v-for="definitionCategory in translateResult.definitions"
        :key="definitionCategory.baseForm + definitionCategory.partOfSpeech"
        :definition-category="definitionCategory"
      />
    </div>
    <translation-result-statistic
      v-if="!!historyRecord && currentView === TranslateResultViews.Statistic"
      :history-record="historyRecord"
      :languages="languages"
      @hard-delete="$emit('hard-delete')"
    />
  </div>
</template>

<style src="./translation-result-content.scss" lang="scss" scoped></style>
