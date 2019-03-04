<template>
  <table class="table-striped results non-clickable">
    <thead>
      <tr>
        <sortable-header v-if="isColumnVisible(SortColumn.Input)" class="word-column" :sort-column="SortColumn.Input" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.Translation)" class="translation-column" :sort-column="SortColumn.Translation" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.Tags)" class="tags-column" :sort-column="SortColumn.Tags" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.TimesTranslated)" class="times-column" :sort-column="SortColumn.TimesTranslated" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.SourceLanguage)" class="source-language-column" :sort-column="SortColumn.SourceLanguage" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.TargetLanguage)" class="target-language-column" :sort-column="SortColumn.TargetLanguage" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.LastTranslatedDate)" class="last-translated-column" :sort-column="SortColumn.LastTranslatedDate" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
        <sortable-header v-if="isColumnVisible(SortColumn.IsArchived)" class="archived-column" :sort-column="SortColumn.IsArchived" :current-sort-column.sync="sortColumn$" :current-sort-order.sync="sortOrder$" />
      </tr>
    </thead>
    <tbody v-if="historyRecords.length !== 0">
      <tr v-for="record in historyRecords" :key="record.sentence + record.isForcedTranslation + record.sourceLanguage + record.targetLanguage" @click="translateHistoryRecord(record)">
        <td class="word-column" v-overflow-tooltip v-if="isColumnVisible(SortColumn.Input)">
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
        </td>
        <td class="translation-column" v-overflow-tooltip v-if="isColumnVisible(SortColumn.Translation)">
          <span v-if="!!record.translation">{{record.translation}}</span>
          <span v-else class="no-translation">No Translation</span>
        </td>
        <td class="tags-column" v-if="isColumnVisible(SortColumn.Tags)" @click.stop.prevent>
          <tags-editor :tags="record.tags" @update-tags="updateRecordTags(record, $event)" @tag-clicked="tagClicked" :compact-view="true" :clickable="true"/>
        </td>
        <td class="times-column" v-if="isColumnVisible(SortColumn.TimesTranslated)">{{record.translationsNumber !== 0 ? record.translationsNumber : "-"}}</td>
        <td class="source-language-column" v-overflow-tooltip v-if="isColumnVisible(SortColumn.SourceLanguage)">{{languages.get(record.sourceLanguage) || record.sourceLanguage}}</td>
        <td class="target-language-column" v-overflow-tooltip v-if="isColumnVisible(SortColumn.TargetLanguage)">{{languages.get(record.targetLanguage) || record.targetLanguage}}</td>
        <td class="last-translated-column" v-overflow-tooltip v-if="isColumnVisible(SortColumn.LastTranslatedDate)">
          {{record.lastTranslatedDate | date-time}}
          <i class="icon icon-cloud-thunder synced-icon" v-if="!record.isSyncedWithServer" title="Record is not synced with server"/>
        </td>
        <td class="archived-column" v-if="isColumnVisible(SortColumn.IsArchived)" @click.stop.prevent>
          <icon-button v-if="record.isArchived" title="Restore" @click="setArchivedStatus({record: record, isArchived: false})" :tab-index="-1"><i class="icon icon-trash restore"/></icon-button>
          <icon-button v-else title="Archive" @click="setArchivedStatus({record: record, isArchived: true})" :tab-index="-1"><i class="icon icon-trash archive"/></icon-button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td :colspan="numberOfVisibleColumns" class="no-records-available">
          No History Records Avialable
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script src="./HistoryTable.ts" lang="ts"></script>
<style src="./HistoryTable.scss" lang="scss" scoped></style>
