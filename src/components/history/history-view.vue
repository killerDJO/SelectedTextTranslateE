<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { cloneDeep, uniq } from 'lodash-es';

import { useAppStore } from '~/app.store';
import { useTranslateResultStore } from '~/components/translation/translation-result/translation-result.store';
import TranslationResult from '~/components/translation/translation-result/translation-result.vue';
import type { TranslateRequest } from '../translation/models/requests.model';
import { HistoryColumns, Tag } from '~/host/models/settings.model';
import { settingsProvider } from '~/services/settings-provider.service';

import ColumnsEditor from './columns-editor/columns-editor.vue';
import TagsEditor from './tags-editor/tags-editor.vue';
import HistoryUser from './history-auth/history-user/history-user.vue';
import { useHistoryStore } from './history.store';
import { useHistoryAuthStore } from './history-auth/history-auth.store';
import type { HistoryRecord } from './models/history-record.model';
import HistoryLogin from './history-auth/history-login/history-login.vue';
import HistoryTable from './history-table/history-table.vue';
import HistoryPaginator from './history-paginator/history-paginator.vue';
import HistoryFilter from './history-filter/history-filter.vue';
import HistoryMerger from './history-merger/history-merger.vue';

const app = useAppStore();
const history = useHistoryStore();
const historyAuth = useHistoryAuthStore();
const translateResult = useTranslateResultStore();

const isFilterVisible = ref(false);
const isTranslationVisible = ref(false);

const historyMergerInstance = ref<InstanceType<typeof HistoryMerger> | null>(null);

const columns = computed(() => app.settings.display.historyColumns);
const languages = ref(settingsProvider.getLanguages());

watch([() => historyAuth.isSignedIn, () => history.sortOrder, () => history.sortColumn], loadData, {
  immediate: true
});
watch(() => history.filter, loadData, { deep: true });
watch(
  () => app.settings.display.historyPageSize,
  () => {
    history.refreshRecords();
  }
);

onMounted(() => history.setup());

async function loadData() {
  if (historyAuth.isSignedIn) {
    history.pageNumber = 1;
    await history.queryRecords();
  }
}

async function changePage(pageNumber: number) {
  history.pageNumber = pageNumber;
  await history.queryRecords();
}

async function changePageSize(pageSize: number) {
  app.updateSettings({ display: { historyPageSize: pageSize } });
}

async function updateColumns(columns: HistoryColumns) {
  await app.updateSettings({ display: { historyColumns: columns } });
}

async function updateCurrentTags(tags: Tag[]) {
  await app.updateSettings({ translation: { tags: cloneDeep(tags) } });
}

async function toggleActiveTag(tag: Tag) {
  const clonedTags = cloneDeep(app.settings.translation.tags).filter(
    currentTag => currentTag.tag !== tag.tag
  );

  await updateCurrentTags(
    clonedTags.concat([
      {
        tag: tag.tag,
        enabled: !tag.enabled
      }
    ])
  );
}

function translateHistoryRecord(record: HistoryRecord) {
  translateResult.showHistoryRecord(record);
  isFilterVisible.value = false;
  isTranslationVisible.value = true;
}

function onTagClicked(tag: Tag) {
  history.filter.tags = uniq((history.filter.tags ?? []).concat([tag.tag]));
  isFilterVisible.value = true;
  isTranslationVisible.value = false;
}

function isFilterActive(): boolean {
  const filter = history.filter;
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

async function hardDelete() {
  await translateResult.hardDelete();
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
            :tags="app.settings.translation.tags"
            :clickable="true"
            @update-tags="updateCurrentTags"
            @tag-clicked="toggleActiveTag"
          />
        </div>
        <div class="header-controls">
          <app-checkbox
            :value="history.filter.starredOnly"
            :label="'Starred Only'"
            :left-to-right="true"
            @update:value="starredOnly => (history.filter.starredOnly = starredOnly)"
          />
          <toggle-button :is-active="isFilterVisible" class="filter-button" @click="toggleFilter()">
            <font-awesome-icon
              v-if="isFilterActive()"
              icon="filter"
              size="xs"
              class="filter-active-icon"
            />Filter</toggle-button
          >

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
        </div>
      </div>
      <div class="results-holder" :class="{ 'full-height': !history.records?.length }">
        <history-table
          v-model:sortColumn="history.sortColumn"
          v-model:sortOrder="history.sortOrder"
          :columns="columns"
          :history-records="history.records ?? []"
          :is-loading="history.isLoading"
          :languages="languages"
          @translate-record="translateHistoryRecord"
          @set-starred-status="(record, isStarred) => history.setStarredStatus(record, isStarred)"
          @play-record="record => history.playRecord(record)"
          @update-tags="
            (record: HistoryRecord, tags: ReadonlyArray<Tag>) => history.updateTags(record, tags)
          "
          @tag-clicked="onTagClicked"
          @set-archived-status="
            (record, isArchived) => history.setArchivedStatus(record, isArchived)
          "
          @update-columns="updateColumns"
        />
        <div class="results-footer">
          <history-user class="history-user" />
          <history-paginator
            v-if="history.records?.length"
            :page-size="app.settings.display.historyPageSize"
            :page-number="history.pageNumber"
            :total-pages="history.totalPages"
            :total-records="history.totalRecords"
            @update:page-number="pageNumber => changePage(pageNumber)"
            @update:page-size="pageSize => changePageSize(pageSize)"
          />
        </div>
      </div>
      <div
        v-if="isFilterVisible || isTranslationVisible"
        class="sidebar-controls"
        @click="closeSidebar()"
      >
        <icon-button title="Close Sidebar" @click="closeSidebar()">
          <font-awesome-icon icon="chevron-right" size="xs" class="icon" />
        </icon-button>
      </div>
      <div
        v-if="isTranslationVisible && !isFilterVisible && translateResult.translateDescriptor"
        class="sidebar"
      >
        <translation-result
          class="history-translate-result"
          :default-view="translateResult.defaultTranslateResultView"
          :translate-result="translateResult.translateResult"
          :translate-descriptor="translateResult.translateDescriptor"
          :history-record="translateResult.historyRecord"
          :is-in-progress="translateResult.isTranslationInProgress"
          :settings="app.settings"
          :languages="languages"
          :is-embedded="true"
          @translate-suggestion="translateResult.translateSuggestion()"
          @force-translation="translateResult.forceTranslation()"
          @translate-text="(request: TranslateRequest) => translateResult.translateText(request)"
          @change-language="translateResult.changeLanguage()"
          @play-text="translateResult.playCurrentSentence()"
          @search="translateResult.search()"
          @archive="translateResult.archive()"
          @unarchive="translateResult.unarchive()"
          @hard-delete="hardDelete()"
          @set-starred-status="(isStarred: boolean) => translateResult.setStarredStatus(isStarred)"
          @update-tags="tags => translateResult.updateTags(tags)"
        />
      </div>
      <div v-else-if="isFilterVisible" class="sidebar">
        <history-filter
          :filter="history.filter"
          @filter-updated="filter => (history.filter = filter)"
          @close="isFilterVisible = false"
        />
      </div>
    </div>
  </div>
  <history-merger ref="historyMergerInstance" />
</template>

<style src="./history-view.scss" lang="scss" scoped></style>
