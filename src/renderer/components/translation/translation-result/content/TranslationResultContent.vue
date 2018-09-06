<template>
    <div class="content" :class="{'is-embedded': isEmbedded}">
        <span class="link-button show-definitions" @click="currentView = TranslateResultViews.Definition" v-if="currentView === TranslateResultViews.Translation && hasDefinitions">Show Definitions</span>
        <span class="link-button show-definitions" @click="currentView = TranslateResultViews.Translation" v-if="currentView === TranslateResultViews.Definition && hasCategories">Show Translations</span>
        <translation-result-content-category
            v-if="currentView === TranslateResultViews.Translation"
            v-for="category in categories"
            :key="category.baseForm + category.partOfSpeech"
            :category="category"
            :translation-result-view-settings="translationResultViewSettings"
            @translate="translate"/>
        <translation-result-definition-category
            v-if="currentView === TranslateResultViews.Definition"
            v-for="definitionCategory in definitions"
            :key="definitionCategory.baseForm + definitionCategory.partOfSpeech"
            :definitionCategory="definitionCategory"/>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
