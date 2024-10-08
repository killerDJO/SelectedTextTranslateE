<script setup lang="ts">
import { computed } from 'vue';

import type {
  DataTableColumnConfig,
  DataTableConfig
} from '~/components/shared/data-table/data-table.vue';
import TagsEditor from '~/components/history/tags-editor/tags-editor.vue';
import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type { SortOrder } from '~/components/history/models/sort-order.enum';
import ForcedTranslationIcon from '~/components/history/icons/forced-translation-icon.vue';
import { HistoryColumnName, HistoryColumns, Tag } from '~/host/models/settings.model';

import SortableHeader from './sortable-header/sortable-header.vue';

interface Props {
  historyRecords: ReadonlyArray<HistoryRecord>;
  sortColumn: HistoryColumnName;
  sortOrder: SortOrder;
  columns: HistoryColumns;
  languages: Map<string, string>;
  isLoading: boolean;
}
const props = defineProps<Props>();

const $emit = defineEmits<{
  (e: 'update:sortColumn', column: HistoryColumnName): void;
  (e: 'update:sortOrder', column: SortOrder): void;
  (e: 'update-columns', columns: HistoryColumns): void;
  (e: 'translate-record', record: HistoryRecord): void;
  (e: 'set-starred-status', record: HistoryRecord, isStarred: boolean): void;
  (e: 'play-record', record: HistoryRecord): void;
  (e: 'update-tags', record: HistoryRecord, tags: ReadonlyArray<Tag>): void;
  (e: 'tag-clicked', tag: Tag): void;
  (e: 'set-archived-status', record: HistoryRecord, isArchived: boolean): void;
}>();

const sortColumn$ = computed({
  get: () => props.sortColumn,
  set: column => $emit('update:sortColumn', column)
});
const sortOrder$ = computed({
  get: () => props.sortOrder,
  set: order => $emit('update:sortOrder', order)
});
const dataTableConfig$ = computed<DataTableConfig<HistoryColumnName>>(() => {
  const columns = Object.keys(props.columns) as HistoryColumnName[];
  return {
    columns: columns
      .map(column => ({
        id: column,
        isVisible: props.columns[column].visible,
        weight: props.columns[column].weight,
        index: props.columns[column].index
      }))
      .sort((a, b) => a.index - b.index)
  };
});

function updateColumnsConfiguration(
  columnsConfiguration: ReadonlyArray<DataTableColumnConfig<HistoryColumnName>>
): void {
  const updatedColumns = columnsConfiguration.reduce((columnsSettings, config, index) => {
    columnsSettings[config.id] = {
      visible: config.isVisible,
      weight: config.weight,
      index: index
    };
    return columnsSettings;
  }, {} as HistoryColumns);
  $emit('update-columns', updatedColumns);
}

function getHeaderSlotId(sortColumn: HistoryColumnName): string {
  return `header.${sortColumn}`;
}

function getBodySlotId(sortColumn: HistoryColumnName): string {
  return `body.${sortColumn}`;
}

const inputHeaderSlotId = getHeaderSlotId('input');
const inputBodySlotId = getBodySlotId('input');

const translationHeaderSlotId = getHeaderSlotId('translation');
const translationBodySlotId = getBodySlotId('translation');

const tagsHeaderSlotId = getHeaderSlotId('tags');
const tagsBodySlotId = getBodySlotId('tags');

const timesHeaderSlotId = getHeaderSlotId('timesTranslated');
const timesBodySlotId = getBodySlotId('timesTranslated');

const sourceHeaderSlotId = getHeaderSlotId('sourceLanguage');
const sourceBodySlotId = getBodySlotId('sourceLanguage');

const targetHeaderSlotId = getHeaderSlotId('targetLanguage');
const targetBodySlotId = getBodySlotId('targetLanguage');

const lastTranslatedHeaderSlotId = getHeaderSlotId('lastTranslatedDate');
const lastTranslatedBodySlotId = getBodySlotId('lastTranslatedDate');

const statusHeaderSlotId = getHeaderSlotId('archived');
const statusBodySlotId = getBodySlotId('archived');
</script>
<template>
  <data-table
    :configuration="dataTableConfig$"
    :records="historyRecords.slice()"
    :is-loading="isLoading"
    class="results"
    @update-columns-configuration="updateColumnsConfiguration"
    @record-click="record => $emit('translate-record', record)"
  >
    <template #[inputHeaderSlotId]>
      <div>
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'input'"
        />
      </div>
    </template>
    <template #[inputBodySlotId]="{ record }">
      <div v-overflow-tooltip class="word-column">
        <icon-button
          v-if="record.isStarred"
          class="icon-star"
          :title="'Unmark Translation'"
          :tab-index="-1"
          @click="$emit('set-starred-status', record, false)"
        >
          <font-awesome-icon icon="star" size="xs" />
        </icon-button>
        <icon-button
          v-else
          class="icon-star-empty"
          :title="'Mark Translation'"
          :tab-index="-1"
          @click="$emit('set-starred-status', record, true)"
        >
          <font-awesome-icon :icon="['far', 'star']" size="xs" />
        </icon-button>
        <div class="word-holder">{{ record.sentence }}</div>
        <forced-translation-icon v-if="record.isForcedTranslation" />
        <icon-button
          :title="'Play'"
          :tab-index="-1"
          class="play-icon"
          @click="$emit('play-record', record)"
        >
          <play-icon class="play-icon"></play-icon>
        </icon-button>
      </div>
    </template>
    <template #[translationHeaderSlotId]>
      <div>
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'translation'"
        />
      </div>
    </template>
    <template #[translationBodySlotId]="{ record }">
      <div v-overflow-tooltip class="translation-column">
        <span v-if="!!record.translateResult.sentence.translation">{{
          record.translateResult.sentence.translation
        }}</span>
        <span v-else class="no-translation">No Translation</span>
      </div>
    </template>

    <template #[tagsHeaderSlotId]>
      <div>
        <sortable-header :sortable="false" :sort-column="'tags'" />
      </div>
    </template>
    <template #[tagsBodySlotId]="{ record }">
      <div class="tags-column">
        <tags-editor
          :tags="record.tags ?? []"
          :compact-view="true"
          :clickable="true"
          @update-tags="tags => $emit('update-tags', record, tags)"
          @tag-clicked="tag => $emit('tag-clicked', tag)"
        />
      </div>
    </template>
    <template #[timesHeaderSlotId]>
      <div>
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'timesTranslated'"
        />
      </div>
    </template>
    <template #[timesBodySlotId]="{ record }">
      <div class="times-column">
        {{ record.translationsNumber !== 0 ? record.translationsNumber : '-' }}
      </div>
    </template>
    <template #[sourceHeaderSlotId]>
      <div>
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'sourceLanguage'"
        />
      </div>
    </template>
    <template #[sourceBodySlotId]="{ record }">
      <div v-overflow-tooltip class="source-language-column">
        {{ languages.get(record.sourceLanguage) || record.sourceLanguage }}
      </div>
    </template>
    <template #[targetHeaderSlotId]>
      <div>
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'targetLanguage'"
        />
      </div>
    </template>
    <template #[targetBodySlotId]="{ record }">
      <div v-overflow-tooltip class="target-language-column">
        {{ languages.get(record.targetLanguage) || record.targetLanguage }}
      </div>
    </template>
    <template #[lastTranslatedHeaderSlotId]>
      <div>
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'lastTranslatedDate'"
        />
      </div>
    </template>
    <template #[lastTranslatedBodySlotId]="{ record }">
      <div class="last-translated-column">
        <span v-overflow-tooltip class="date">{{
          $filters.dateTime(record.lastTranslatedDate)
        }}</span>
      </div>
    </template>
    <template #[statusHeaderSlotId]>
      <div class="archived-column">
        <sortable-header
          v-model:current-sort-column="sortColumn$"
          v-model:current-sort-order="sortOrder$"
          :sort-column="'archived'"
        />
      </div>
    </template>
    <template #[statusBodySlotId]="{ record }">
      <div class="archived-column">
        <icon-button
          v-if="record.isArchived"
          title="Restore"
          @click="$emit('set-archived-status', record, false)"
        >
          <font-awesome-icon class="icon-restore" icon="trash" size="sm"
        /></icon-button>
        <icon-button v-else title="Archive" @click="$emit('set-archived-status', record, true)"
          ><font-awesome-icon class="icon-archive" icon="trash" size="sm"
        /></icon-button>
      </div>
    </template>
    <template #empty
      ><div class="no-history-records">
        <font-awesome-icon class="icon-no-records" icon="book-open" /> No History Records
      </div>
    </template>
  </data-table>
</template>

<style src="./history-table.scss" lang="scss" scoped></style>
