<template>
    <div class="content" :class="{'is-embedded': isEmbedded}">
        <div class="actions">
            <link-button :text="'Translate from ' + languages.get(languageSuggestion)" @click="changeLanguage" class="action" v-if="hasLanguageSuggestion"/>
            <link-button :text="'Show Translations'" class="action" @click="currentView = TranslateResultViews.Translation" v-if="currentView !== TranslateResultViews.Translation && hasCategories" />
            <link-button :text="'Show Definitions'"  class="action" @click="currentView = TranslateResultViews.Definition" v-if="currentView !== TranslateResultViews.Definition && hasDefinitions" />
            <link-button :text="'Search'" @click="search" class="action"/>
            <link-button
                :text="`Translated ${historyRecord.translationsNumber === 1 ? 'one time' : `${historyRecord.translationsNumber} times`}`"
                class="action"
                @click="currentView = TranslateResultViews.Statistic"
                v-if="currentView !== TranslateResultViews.Statistic" />
            <span class="action offline-status" v-if="isOffline">Offline</span>
        </div>
        <translation-result-content-category
            v-if="currentView === TranslateResultViews.Translation"
            v-for="category in historyRecord.translateResult.categories"
            :key="category.baseForm + category.partOfSpeech"
            :category="category"
            :translation-result-view-settings="translationResultViewSettings"
            @translate="translate"/>
        <translation-result-definition-category
            v-if="currentView === TranslateResultViews.Definition"
            v-for="definitionCategory in historyRecord.translateResult.definitions"
            :key="definitionCategory.baseForm + definitionCategory.partOfSpeech"
            :definitionCategory="definitionCategory"/>
        <translation-result-statistic
            v-if="currentView === TranslateResultViews.Statistic"
            :history-record="historyRecord"
            :languages="languages"
            @refresh-translation="refreshTranslation"/>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
