<template>
    <div class="translation" v-if="isInitialized && isVisible">
        <translation-result
            v-if="hasResult || isTranslationInProgress"
            :default-view="defaultTranslateResultView"
            :history-record="translationHistoryRecord"
            :is-in-progress="isTranslationInProgress"
            :translation-result-view-settings="translationResultViewSettings"
            :languages="languages"
            :is-offline="isOffline"
            @translate-suggestion="translateSuggestion"
            @force-translation="forceTranslation"
            @refresh-translation="refreshTranslation"
            @translate-text="translateText"
            @change-language="changeLanguage"
            @play-text="playText"
            @search="search"
            @archive="archive"
            @set-starred-status="setStarredStatus"
            @update-tags="updateTags"/>
        <div v-else>
            <div class="no-text-data" v-if="!showInput">No text data selected</div>
            <translation-input
                @translate-text="translateText"
                @play-text="playTextFromRequest"
                :languages="languages"
                :language-settings="languageSettings" />
        </div>
    </div>
</template>

<script src="./Translation.ts" lang="ts"></script>
<style src="./Translation.scss" lang="scss" scoped></style>
