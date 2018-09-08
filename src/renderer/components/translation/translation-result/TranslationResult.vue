<template>
    <div class="translate-result">
        <div v-if="showProgressIndicator" class="loading-holder">
            <span class="loading-indicator"/>
            <span>Translating text...</span>
        </div>
        <div v-else>
            <translation-result-header
                :history-record="historyRecord"
                :is-embedded="isEmbedded"
                @translate-suggestion="translateSuggestion"
                @force-translation="forceTranslation"
                @translate-text="translateText"
                @play-text="playText"
                @set-starred-status="setStarredStatus"/>
            <translation-result-content
                :history-record="historyRecord"
                :translation-result-view-settings="translationResultViewSettings"
                :default-view="defaultView"
                :is-embedded="isEmbedded"
                :languages="languages"
                @translate="translateText"
                @change-language="changeLanguage"
                @refresh-translation="refreshTranslation"/>
        </div>
    </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
