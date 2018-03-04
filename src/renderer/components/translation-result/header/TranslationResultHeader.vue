<template>
    <div class="header">
        <div class="translation">{{ sentence.translation }}</div>
        <i class="play" @click="playText"></i>
        <div class="origin">{{ sentence.origin }}</div>
        <div class="header-actions">
            <span v-if="isInputCorrected">(corrected from <a class="link-button" @click="forceTranslation">{{sentence.input}})</a></span>
            <span v-if="hasSuggestion">(maybe you meant <a class="link-button" @click="translateSuggestion">{{sentence.suggestion}})</a></span>
        </div>
    </div>
</template>

<script src="./TranslationResultHeader.ts" lang="ts"></script>
<style src="./TranslationResultHeader.scss" lang="scss" scoped></style>
