<template>
    <div class="translate-result">
        <div v-if="isInProgress" class="loading-holder">
            <span class="loading-indicator"/>
            <span>Translating text...</span>
        </div>
        <div v-else>
            <translation-result-header
                :sentence="translateResult.sentence"
                @translate-suggestion="translateSuggestion"
                @force-translation="forceTranslation"
                @translate-text="translateText"
                @play-text="playText"/>
            <translation-result-content
                :categories="translateResult.categories"
                :definitions="translateResult.definitions"
                :translation-result-view-settings="translationResultViewSettings"
                :default-view="defaultView"/>
        </div>
    </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
