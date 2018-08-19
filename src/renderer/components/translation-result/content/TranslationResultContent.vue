<template>
    <div class="content">
        <span class="link-button show-definitions" @click="showDefinitions = true" v-if="!showDefinitions && hasDefinitions">Show Definitions</span>
        <span class="link-button show-definitions" @click="showDefinitions = false" v-if="showDefinitions && hasCategories">Show Translations</span>
        <translation-result-content-category
            v-if="!showDefinitions"
            v-for="category in categories"
            :key="category.baseForm + category.partOfSpeech"
            :category="category"
            :translation-result-view-settings="translationResultViewSettings"/>
        <translation-result-definition-category
            v-if="showDefinitions"
            v-for="definitionCategory in definitions"
            :key="definitionCategory.baseForm + definitionCategory.partOfSpeech"
            :definitionCategory="definitionCategory"/>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
