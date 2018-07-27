<template>
    <div class="translate-result" v-if="isInitialized">
        <div v-if="hasResult">
            <translation-result-header
                :sentence="translateResult.sentence"
                @translate-suggestion="translateSuggestion"
                @force-translation="forceTranslation"
                @play-text="playText"/>
            <translation-result-content
                :categories="translateResult.categories"
                :translation-result-view-settings="translationResultViewSettings"/>
        </div>
        <div v-else>Please select text to translate</div>
    </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
