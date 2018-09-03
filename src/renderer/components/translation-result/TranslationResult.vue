<template>
    <div class="translate-result" v-if="isInitialized">
        <div v-if="isInProgress" class="loading-holder">
            <span class="loading-indicator"/>
            <span>Translating text...</span>
        </div>
        <div v-else-if="showInput">
            <translation-input @translate-text="translateText"/>
        </div>
        <div v-else-if="hasResult">
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
        <div v-else>
            <div  class="no-text-data">No text data selected</div>
            <translation-input @translate-text="translateText"/>
        </div>
    </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
