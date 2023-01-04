<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { cloneDeep, debounce, isEqual } from 'lodash-es';
import { computed, reactive, watch } from 'vue';
import { helpers, maxValue, minValue } from '@vuelidate/validators';

import type { Tag } from '@selected-text-translate/common/settings/settings';

import TagsEditor from '~/components/history/tags-editor/tags-editor.vue';
import { executeIfValid } from '~/utils/execute-if-valid';
import type { HistoryFilter } from '~/components/history/models/history-filter';
import { useAppStore } from '~/app.store';
import type { SelectedLanguages } from '~/components/shared/language-selector/language-selector.vue';

interface Props {
  filter: HistoryFilter;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'filter-updated', filter: HistoryFilter): void;
  (e: 'close'): void;
}>();

const app = useAppStore();

const state = reactive<HistoryFilter>(cloneDeep(props.filter));
const rules = computed(() => ({
  minTranslatedTime: {
    minValue: helpers.withMessage('Should be a positive number', minValue(0)),
    maxValue: helpers.withMessage(
      'Should be smaller than upper bound',
      maxValue(state.maxTranslatedTime ?? Infinity)
    )
  },
  maxTranslatedTime: {
    minValue: helpers.withMessage('Should be bigger than 1', minValue(1))
  }
}));
const v$ = useVuelidate(rules as any, state, { $autoDirty: true });

watch(state, async () => await executeIfValid(v$, () => $emit('filter-updated', cloneDeep(state))));
watch(
  () => props.filter,
  () => {
    if (!isEqual(props.filter, state)) {
      Object.assign(state, props.filter);
    }
  },
  { deep: true }
);

function setTags(tags: ReadonlyArray<Tag>) {
  state.tags = tags.map(tag => tag.tag);
}

function onLanguagesUpdated(languages: SelectedLanguages): void {
  Object.assign(state, languages);
}

const debounceInput = debounce((event: Event, setter: (value: string) => void) => {
  setter((event.target as HTMLInputElement).value);
}, 500);

function clearFilter() {
  $emit('filter-updated', {
    starredOnly: state.starredOnly,
    includeArchived: false,
    word: undefined,
    maxLastTranslatedDate: undefined,
    maxTranslatedTime: undefined,
    minLastTranslatedDate: undefined,
    minTranslatedTime: undefined,
    sourceLanguage: undefined,
    targetLanguage: undefined,
    translation: undefined,
    tags: []
  });
  $emit('close');
}
</script>

<template>
  <div class="history-filter">
    <div class="form-group history-filter-item not-validated">
      <label>Word:</label>
      <input
        :value="state.word"
        type="text"
        class="form-control"
        @input="event => debounceInput(event, value => (state.word = value))"
      />
    </div>
    <div class="form-group history-filter-item not-validated">
      <label>Translation:</label>
      <input
        :value="state.translation"
        type="text"
        class="form-control"
        @input="event => debounceInput(event, value => (state.translation = value))"
      />
    </div>

    <div class="form-group history-filter-item not-validated">
      <label>Languages:</label>
      <language-selector
        :languages="state"
        :all-languages="app.settings.supportedLanguages"
        :allow-unselect="true"
        @languages-updated="onLanguagesUpdated"
      />
    </div>
    <div class="form-group history-filter-item not-validated">
      <label>Last Translated:</label>
      <div class="date-selector">
        <app-datepicker
          v-model:value="state.minLastTranslatedDate"
          :max-date="state.maxLastTranslatedDate"
          :disable-future-dates="true"
          class="form-control"
        />
        <div class="range-separator">to</div>
        <app-datepicker
          v-model:value="state.maxLastTranslatedDate"
          :min-date="state.minLastTranslatedDate"
          :disable-future-dates="true"
          class="form-control"
        />
      </div>
    </div>
    <div class="form-group history-filter-item range-input">
      <label>Times Translated:</label>
      <div class="inputs-wrapper">
        <validated-field :errors="v$.minTranslatedTime.$errors">
          <input
            v-model.number="state.minTranslatedTime"
            type="number"
            min="0"
            :max="state.maxTranslatedTime"
            class="form-control"
          />
        </validated-field>
        <div class="range-separator">to</div>
        <validated-field
          :errors="v$.maxTranslatedTime.$errors"
          :hide-message="v$.minTranslatedTime.$error"
        >
          <input
            v-model.number="state.maxTranslatedTime"
            type="number"
            :min="Math.max(state.minTranslatedTime ?? 0, 1)"
            class="form-control"
          />
        </validated-field>
      </div>
    </div>
    <div class="tags form-group history-filter-item">
      <label>Tags:</label>
      <tags-editor :tags="state.tags ?? []" class="editor" @update-tags="setTags" />
    </div>
    <div class="footer">
      <app-checkbox v-model:value="state.includeArchived" :label="'Show Archived'" />
      <app-button text="Clear Filter" :primary="false" @click="clearFilter()" />
    </div>
  </div>
</template>

<style src="./history-filter.scss" lang="scss" scoped></style>
