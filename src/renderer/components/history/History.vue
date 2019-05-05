<template>
  <div class="history clearfix" v-if="isInitialized">
    <div class="grid-holder" :class="{'sidebar-visible': isTranslationVisible || isFilterVisible}">
      <div class="results-header clearfix">
        <div class="tags" v-if="!!currentTags">
          <span class="tags-label">Active Tags:</span> <tags-editor :tags="currentTags" @update-tags="updateCurrentTags" @tag-clicked="toggleActiveTag" :clickable="true"/>
        </div>
        <div>
          <checkbox v-model="starredOnly$" :label="'Starred Only'" :left-to-right="true" />
          <toggle-button @click="isFilterVisible = !isFilterVisible" :text="'Filter'" :is-active="isFilterVisible" class="filter-button" v-tab-index/>
          <toggle-button @click="isMergerVisible = !isMergerVisible" :text="'Merge'" :is-active="isMergerVisible" class="filter-button" v-tab-index/>
          <columns-editor
              class="columns-customizer"
              :columns="columns"
              @update-columns="updateColumns" />
        </div>
      </div>
      <div class="sidebar-header" v-if="isTranslationVisible">
        <icon-button title="Hide Translation" @click="hideTranslation"><i class="icon icon-cancel"/></icon-button>
        <p class="title">Translation</p>
      </div>
      <div class="sidebar-header" v-else-if="isFilterVisible">
        <icon-button title="Hide Filter" @click="hideFilter"><i class="icon icon-cancel"/></icon-button>
        <p class="title">Filter</p>
      </div>
      <div class="results-holder">
        <history-table
          :sortColumn.sync="sortColumn$" 
          :sortOrder.sync="sortOrder$" 
          :columns="columns"
          :history-records="historyRecords"
          :languages="languages"
          @translate-history-record="translateHistoryRecord"
          @set-starred-status="setStarredStatus"
          @play-record="playRecord"
          @update-tags="updateTags"
          @tag-clicked="onTagClicked"
          @set-archived-status="setArchivedStatus"
          @update-columns="updateColumns" />
        <div class="results-footer">
          <history-sync class="sync-control" :current-user="currentUser"/>
          <div class="pagination-holder" v-if="hasRecords">
            <span class="records-count">{{totalRecords}} records</span>
            <paginate
              v-model="pageNumber$"
              :page-count="pageCount"
              :prev-text="'Prev'"
              :next-text="'Next'"
              :container-class="'pagination'"
              :break-view-text="'...'">
            </paginate>
          </div>
        </div>
      </div>
      <div v-if="isTranslationVisible" class="sidebar">
        <translation-result
              :default-view="defaultTranslateResultView"
              :history-record="translationHistoryRecord"
              :is-in-progress="isTranslationInProgress"
              :translation-result-view-settings="translationResultViewSettings"
              :is-embedded="true"
              :languages="languages"
              :is-offline="isOffline"
              @translate-suggestion="translateSuggestion"
              @force-translation="forceTranslation"
              @refresh-translation="refreshTranslation"
              @translate-text="translateText"
              @change-language="changeLanguage"
              @play-text="playText"
              @search="search"
              @archive="archive"
              @set-starred-status="setStarredStatus"
              @update-tags="updateTags"/>
      </div>
      <div v-else-if="isFilterVisible" class="sidebar">
        <history-filter
              :filter="filter"
              :languages="languages"
              @filter-updated="updateFilter"/>
      </div>
      <div class="history-trail"></div>
      <history-merger :show.sync="isMergerVisible" :languages="languages"/>
    </div>
  </div>
</template>

<script src="./History.ts" lang="ts"></script>
<style src="./History.scss" lang="scss" scoped></style>
