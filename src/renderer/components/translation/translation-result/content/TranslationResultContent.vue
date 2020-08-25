<template>
    <div class="content" :class="{'is-embedded': isEmbedded}">
        <div class="actions" :class="{'tags-visible': showTags}">
            <link-button :text="'From ' + languages.get(languageSuggestion)" @click="changeLanguage" class="action" v-if="hasLanguageSuggestion"/>
            <link-button :text="toggleTagsButtonText" class="action" @click="showTags = !showTags" />
            <link-button :text="'Translations'" class="action" @click="currentView = TranslateResultViews.Translation" v-if="currentView !== TranslateResultViews.Translation && hasCategories" />
            <link-button :text="'Definitions'"  class="action" @click="currentView = TranslateResultViews.Definition" v-if="currentView !== TranslateResultViews.Definition && hasDefinitions" />
            <link-button :text="'Search'" @click="search" class="action"/>
            <link-button
                :text="`${historyRecord.translationsNumber === 1 ? '1 time' : `${historyRecord.translationsNumber} times`}`"
                class="action"
                @click="currentView = TranslateResultViews.Statistic"
                v-if="currentView !== TranslateResultViews.Statistic" />
            <span class="action offline-status" v-if="isOffline">Offline</span>
        </div>
        <div class="tags" v-if="showTags">
          <tags-editor :tags="historyRecord.tags" :compact-view="true" @update-tags="updateTags" @set-show-tag-input="setShowTagInput"/>
        </div>
        <div class="similar-words" v-if="currentView === TranslateResultViews.Definition && similarWords.length > 0">
          <span class="similar-words-label">similar - </span>
          <span v-for="(similarWord, index) in similarWords" :key="similarWord">
            <span class="similar-word" @click="translate(similarWord)">{{similarWord}}</span>{{index !== similarWords.length - 1 ? ", " : ""}}
        </span>
        </div>
        <div v-if="currentView === TranslateResultViews.Translation">
            <translation-result-content-category
                v-for="category in historyRecord.translateResult.categories"
                :key="category.baseForm + category.partOfSpeech"
                :category="category"
                :translation-result-view-settings="translationResultViewSettings"
                @translate="translate"/>
        </div>
        <div v-if="currentView === TranslateResultViews.Definition">
            <translation-result-definition-category
                v-for="definitionCategory in historyRecord.translateResult.definitions"
                :key="definitionCategory.baseForm + definitionCategory.partOfSpeech"
                :definitionCategory="definitionCategory"/>
        </div>
        <translation-result-statistic
            v-if="currentView === TranslateResultViews.Statistic"
            :history-record="historyRecord"
            :languages="languages"
            @refresh-translation="refreshTranslation"/>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
