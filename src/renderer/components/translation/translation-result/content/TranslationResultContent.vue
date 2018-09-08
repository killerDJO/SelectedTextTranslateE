<template>
    <div class="content" :class="{'is-embedded': isEmbedded}">
        <div class="change-actions">
            <link-button :text="'Show Definitions'"     @click="currentView = TranslateResultViews.Definition" v-if="currentView !== TranslateResultViews.Definition && hasDefinitions" />
            <link-button :text="'Show Translations'"    @click="currentView = TranslateResultViews.Translation" v-if="currentView !== TranslateResultViews.Translation && hasCategories" />
            <link-button :text="'Statistic'"            @click="currentView = TranslateResultViews.Statistic" v-if="currentView !== TranslateResultViews.Statistic && showStatistic" />
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
            @refresh-translation="refreshTranslation"/>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
