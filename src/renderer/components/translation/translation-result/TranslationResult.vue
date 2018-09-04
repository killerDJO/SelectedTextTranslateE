<template>
    <div class="translate-result">
        <div v-if="showProgressIndicator" class="loading-holder">
            <span class="loading-indicator"/>
            <span>Translating text...</span>
        </div>
        <div v-else>
            <translation-result-header
                :sentence="translateResult.sentence"
                :is-embedded="isEmbedded"
                @translate-suggestion="translateSuggestion"
                @force-translation="forceTranslation"
                @translate-text="translateText"
                @play-text="playText"/>
            <translation-result-content
                :categories="translateResult.categories"
                :definitions="translateResult.definitions"
                :translation-result-view-settings="translationResultViewSettings"
                :default-view="defaultView"
                :is-embedded="isEmbedded"/>
        </div>
    </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
