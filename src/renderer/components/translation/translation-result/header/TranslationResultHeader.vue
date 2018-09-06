<template>
    <div class="header" :class="{'is-embedded': isEmbedded}">
        <div class="translation">
            <span class="icon icon-star" v-if="historyRecord.isStarred" @click="setStarredStatus(false)"></span>
            <span class="icon icon-star-empty" v-else @click="setStarredStatus(true)"></span>
            <span v-if="!!sentence.translation"> {{ sentence.translation }} </span>
            <span v-else class="no-translation"> No Translation </span>
        </div>
        <i class="play" @click="playText"></i>
        <div class="origin" @blur="translateText($event.target.innerText)" @keydown.enter.prevent="translateText($event.target.innerText)" contenteditable="true">{{ sentence.origin }}</div>
        <div class="header-actions">
            <span v-if="isInputCorrected">(corrected from <a class="link-button" @click="forceTranslation">{{sentence.input}})</a></span>
            <span v-if="hasSuggestion">(maybe you meant <a class="link-button" @click="translateSuggestion">{{sentence.suggestion}})</a></span>
        </div>
    </div>
</template>

<script src="./TranslationResultHeader.ts" lang="ts"></script>
<style src="./TranslationResultHeader.scss" lang="scss" scoped></style>
