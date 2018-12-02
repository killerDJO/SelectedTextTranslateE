<template>
  <div>
    <div class="form-group history-filter-item">
      <label>Word:</label>
      <input v-tab-index type="text" class="form-control" v-model="currentFilter.word">
    </div>
    <div class="form-group history-filter-item">
      <label>Translation:</label>
      <input v-tab-index type="text" class="form-control" v-model="currentFilter.translation">
    </div>
    <div class="form-group history-filter-item inline-inputs">
      <label>Times Translated:</label>
      <validated-field :validation-message="validationResult.minTranslatedTime">
        <input v-tab-index type="number" min="0" class="form-control" v-model.number="currentFilter.minTranslatedTime">
      </validated-field>
      to
      <validated-field :validation-message="validationResult.maxTranslatedTime">
        <input v-tab-index type="number" min="0" class="form-control" v-model.number="currentFilter.maxTranslatedTime">
      </validated-field>
    </div>
    <div class="form-group history-filter-item">
      <label>Tags:</label>
      <tags-editor :tags="currentFilter.tags" @update-tags="currentFilter.tags = $event" class="tags-filter"/>
    </div>
    <div class="form-group history-filter-item">
      <label>Languages:</label>
      <language-selector
        :languages="selectedLanguages"
        :all-languages="allLanguages"
        :allow-unselect="true"
        @languages-updated="onLanguagesUpdated"/>
    </div>
    <div class="form-group history-filter-item">
      <label>Last Translated:</label>
      <div class="date-selector">
        <validated-field :validation-message="validationResult.minLastTranslatedDate">
          <datepicker :value.sync="currentFilter.minLastTranslatedDate" :disable-future-dates="true"/>
        </validated-field>
        to
        <validated-field :validation-message="validationResult.maxLastTranslatedDate">
          <datepicker :value.sync="currentFilter.maxLastTranslatedDate" :disable-future-dates="true"/>
        </validated-field>
      </div>
    </div>
    <div class="form-group history-filter-item">
      <checkbox v-model="currentFilter.unsyncedOnly" :label="'Unsynced only'" />
    </div>
  </div>
</template>

<script src="./HistoryFilter.ts" lang="ts"></script>
<style src="./HistoryFilter.scss" lang="scss" scoped></style>
