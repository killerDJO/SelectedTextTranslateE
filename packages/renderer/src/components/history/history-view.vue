<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { cloneDeep, uniq } from 'lodash-es';

import type { ColumnSettings, Tag } from '@selected-text-translate/common/settings/settings';

import { useAppStore } from '~/app.store';
import { normalizeTag } from '~/utils/normalize-tag';
import { useTranslateResultStore } from '~/components/translation/translation-result/translation-result.store';
import TranslationResult from '~/components/translation/translation-result/translation-result.vue';

import ColumnsEditor from './columns-editor/columns-editor.vue';
import TagsEditor from './tags-editor/tags-editor.vue';
import HistoryUser from './history-auth/history-user/history-user.vue';
import { useHistoryStore } from './history.store';
import { useHistoryAuthStore } from './history-auth/history-auth.store';
import type { HistoryRecord } from './models/history-record';
import HistoryLogin from './history-auth/history-login/history-login.vue';
import HistoryTable from './history-table/history-table.vue';
import HistoryPaginator from './history-paginator/history-paginator.vue';
import HistoryFilter from './history-filter/history-filter.vue';
import HistoryMerger from './history-merger/history-merger.vue';

const appStore = useAppStore();
const historyStore = useHistoryStore();
const historyAuth = useHistoryAuthStore();
const translationResultStore = useTranslateResultStore();

const isFilterVisible = ref(false);
const isTranslationVisible = ref(false);

const historyMergerInstance = ref<InstanceType<typeof HistoryMerger> | null>(null);

const columns = computed(() => appStore.settings.views.history.renderer.columns);

watch(
  [() => historyAuth.isSignedIn, () => historyStore.sortOrder, () => historyStore.sortColumn],
  loadData,
  { immediate: true }
);
watch(() => historyStore.filter, loadData, { deep: true });
watch(
  () => appStore.settings.views.history.renderer.pageSize,
  () => {
    historyStore.refreshRecords();
  }
);

onMounted(() => historyStore.setup());

async function loadData() {
  if (historyAuth.isSignedIn) {
    historyStore.pageNumber = 1;
    await historyStore.queryRecords();
  }
}

async function changePage(pageNumber: number) {
  historyStore.pageNumber = pageNumber;
  await historyStore.queryRecords();
}

function updateColumns(columns: ReadonlyArray<ColumnSettings>) {
  appStore.updateSettings({ views: { history: { renderer: { columns } } } });
}

function updateCurrentTags(tags: Tag[]) {
  appStore.updateSettings({ tags: { currentTags: cloneDeep(tags) } });
}

function toggleActiveTag(tag: Tag) {
  const clonedTags = cloneDeep(appStore.settings.tags.currentTags)
    .map(normalizeTag)
    .filter(currentTag => currentTag.tag !== tag.tag);

  updateCurrentTags(
    clonedTags.concat([
      {
        tag: tag.tag,
        isEnabled: !tag.isEnabled
      }
    ])
  );
}

function translateHistoryRecord(record: HistoryRecord) {
  translationResultStore.showHistoryRecord(record);
  isFilterVisible.value = false;
  isTranslationVisible.value = true;
}

function onTagClicked(tag: Tag) {
  historyStore.filter.tags = uniq((historyStore.filter.tags ?? []).concat([tag.tag]));
  isFilterVisible.value = true;
  isTranslationVisible.value = false;
}

function isFilterActive(): boolean {
  const filter = historyStore.filter;
  return (
    !!filter.word ||
    !!filter.translation ||
    !!filter.minTranslatedTime ||
    !!filter.maxTranslatedTime ||
    !!filter.tags?.length ||
    !!filter.maxLastTranslatedDate ||
    !!filter.maxLastTranslatedDate ||
    !!filter.sourceLanguage ||
    !!filter.targetLanguage ||
    !!filter.includeArchived
  );
}

function closeSidebar() {
  isFilterVisible.value = false;
  isTranslationVisible.value = false;
}

function toggleFilter() {
  isFilterVisible.value = !isFilterVisible.value;
  isTranslationVisible.value = false;
}
</script>

<template>
  <div class="history">
    <app-loader v-if="historyAuth.isSetupInProgress" :large="true"></app-loader>
    <div v-if="!historyAuth.isSignedIn && !historyAuth.isSetupInProgress">
      <history-login></history-login>
    </div>
    <div
      v-if="historyAuth.isSignedIn"
      class="grid-holder"
      :class="{ 'sidebar-visible': isTranslationVisible || isFilterVisible }"
    >
      <div class="results-header">
        <div class="tags">
          <span class="tags-label">Tags:</span>
          <tags-editor
            :tags="appStore.settings.tags.currentTags"
            :clickable="true"
            @update-tags="updateCurrentTags"
            @tag-clicked="toggleActiveTag"
          />
        </div>
        <div class="header-controls">
          <app-checkbox
            :value="historyStore.filter.starredOnly"
            :label="'Starred Only'"
            :left-to-right="true"
            @update:value="starredOnly => (historyStore.filter.starredOnly = starredOnly)"
          />
          <toggle-button
            text="Filter"
            :is-active="isFilterActive()"
            class="filter-button"
            @click="toggleFilter()"
          />
          <app-button
            text="Merge"
            :primary="false"
            class="filter-button"
            @click="historyMergerInstance?.open()"
          />
          <columns-editor
            class="columns-customizer"
            :columns="columns"
            @update-columns="updateColumns"
          />
          <app-button
            v-if="isFilterVisible || isTranslationVisible"
            icon="angles-right"
            class="hide-sidebar-button"
            :primary="false"
            @click="closeSidebar()"
          />
        </div>
      </div>
      <div class="results-holder" :class="{ 'full-height': !historyStore.records?.length }">
        <history-table
          v-model:sortColumn="historyStore.sortColumn"
          v-model:sortOrder="historyStore.sortOrder"
          :columns="columns"
          :history-records="historyStore.records ?? []"
          :is-loading="historyStore.isLoading"
          :languages="appStore.settings.supportedLanguages"
          @translate-record="translateHistoryRecord"
          @set-starred-status="
            (record, isStarred) => historyStore.setStarredStatus(record, isStarred)
          "
          @play-record="record => historyStore.playRecord(record)"
          @update-tags="(record, tags) => historyStore.updateTags(record, tags)"
          @tag-clicked="onTagClicked"
          @set-archived-status="
            (record, isArchived) => historyStore.setArchivedStatus(record, isArchived)
          "
          @update-columns="updateColumns"
        />
        <div class="results-footer">
          <history-user class="history-user" />
          <history-paginator
            v-if="historyStore.records?.length"
            :page-number="historyStore.pageNumber"
            :total-pages="historyStore.totalPages"
            :total-records="historyStore.totalRecords"
            @update:page-number="pageNumber => changePage(pageNumber)"
          />
        </div>
      </div>
      <div
        v-if="
          isTranslationVisible && !isFilterVisible && translationResultStore.translateDescriptor
        "
        class="sidebar"
      >
        <translation-result
          class="history-translate-result"
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
      </div>
      <div v-else-if="isFilterVisible" class="sidebar">
        <history-filter
          :filter="historyStore.filter"
          @filter-updated="filter => (historyStore.filter = filter)"
          @close="isFilterVisible = false"
        />
      </div>
    </div>
  </div>
  <history-merger ref="historyMergerInstance" />
</template>

<style src="./history-view.scss" lang="scss" scoped></style>
