<template>
    <div class="translate-result">
        <div v-if="hasResult">
            <translation-result-header
                :sentence="translateResult.sentence"
                @translate-suggestion="translateSuggestion"
                @force-translation="forceTranslation"
                @play-text="playText"/>
            <translation-result-content
                :categories="translateResult.categories"
                :score-settings="scoreSettings"
                :result-visibility-settings="resultVisibilitySettings"/>
        </div>
        <div v-else>Please select text to translate</div>
    </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
