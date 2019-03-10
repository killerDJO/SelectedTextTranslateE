<template>
  <data-table :configuration="tableConfiguration" :records="historyRecords" class="results" @update-columns-configuration="updateColumnsConfiguration">

    <div :slot="getHeaderSlotId(SortColumn.Input)">
      <sortable-header :sort-column="SortColumn.Input" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div v-overflow-tooltip :slot="getBodySlotId(SortColumn.Input)" slot-scope="{ record }" class="word-column">
      <icon-button v-if="record.isStarred" @click="setStarredStatus({record: record, isStarred: false})" :title="'Unmark Translation'" :tab-index="-1">
        <span class="icon icon-star" />
      </icon-button>
      <icon-button v-else @click="setStarredStatus({record: record, isStarred: true})" :title="'Mark Translation'" :tab-index="-1">
          <span class="icon icon-star-empty" />
      </icon-button>
      <div class="word-holder">{{record.sentence}}</div>
      <span class="icon icon-flash" v-if="record.isForcedTranslation" title="Forced Translation"></span>
      <icon-button @click="playRecord(record)" :title="'Play'" :tab-index="-1" class="play-icon-holder">
        <span class="play-icon" />
      </icon-button>
    </div>

    <div :slot="getHeaderSlotId(SortColumn.Translation)">
      <sortable-header :sort-column="SortColumn.Translation" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="translation-column" v-overflow-tooltip :slot="getBodySlotId(SortColumn.Translation)" slot-scope="{ record }">
      <span v-if="!!record.translation">{{record.translation}}</span>
      <span v-else class="no-translation">No Translation</span>
    </div>

    <div :slot="getHeaderSlotId(SortColumn.Tags)">
      <sortable-header :sort-column="SortColumn.Tags" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="tags-column" :slot="getBodySlotId(SortColumn.Tags)" slot-scope="{ record }">
      <tags-editor :tags="record.tags" @update-tags="updateRecordTags(record, $event)" @tag-clicked="tagClicked" :compact-view="true" :clickable="true" />
    </div>

    <div :slot="getHeaderSlotId(SortColumn.TimesTranslated)">
      <sortable-header :sort-column="SortColumn.TimesTranslated" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="times-column" :slot="getBodySlotId(SortColumn.TimesTranslated)" slot-scope="{ record }">{{record.translationsNumber !== 0 ? record.translationsNumber : "-"}}</div>

    <div :slot="getHeaderSlotId(SortColumn.SourceLanguage)">
      <sortable-header :sort-column="SortColumn.SourceLanguage" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="source-language-column" v-overflow-tooltip :slot="getBodySlotId(SortColumn.SourceLanguage)" slot-scope="{ record }">{{languages.get(record.sourceLanguage) || record.sourceLanguage}}</div>

    <div :slot="getHeaderSlotId(SortColumn.TargetLanguage)">
      <sortable-header :sort-column="SortColumn.TargetLanguage" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="target-language-column" v-overflow-tooltip :slot="getBodySlotId(SortColumn.TargetLanguage)" slot-scope="{ record }">{{languages.get(record.targetLanguage) || record.targetLanguage}}</div>

    <div :slot="getHeaderSlotId(SortColumn.LastTranslatedDate)">
      <sortable-header :sort-column="SortColumn.LastTranslatedDate" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="last-translated-column" :slot="getBodySlotId(SortColumn.LastTranslatedDate)" slot-scope="{ record }">
      <span v-overflow-tooltip class="date">{{record.lastTranslatedDate | date-time}}</span>
      <i class="icon icon-cloud-thunder synced-icon" v-if="!record.isSyncedWithServer" title="Record is not synced with server"/>
    </div>

    <div class="archived-column" :slot="getHeaderSlotId(SortColumn.IsArchived)">
       <sortable-header :sort-column="SortColumn.IsArchived" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
    </div>
    <div class="archived-column" :slot="getBodySlotId(SortColumn.IsArchived)" slot-scope="{ record }">
      <icon-button v-if="record.isArchived" title="Restore" @click="setArchivedStatus({record: record, isArchived: false})" :tab-index="-1"><i class="icon icon-trash restore"/></icon-button>
      <icon-button v-else title="Archive" @click="setArchivedStatus({record: record, isArchived: true})" :tab-index="-1"><i class="icon icon-trash archive"/></icon-button>
    </div>

    <div slot="empty" class="no-records-available">
        No History Records Avialable
    </div>
  </data-table>
</template>

<script src="./HistoryTable.ts" lang="ts"></script>
<style src="./HistoryTable.scss" lang="scss" scoped></style>
