<template>
    <div class="header" :class="{'is-embedded': isEmbedded}">
        <div class="translation-actions">
            <icon-button v-if="historyRecord.isStarred" @click="setStarredStatus(false)" :title="'Unmark Translation'">
                <span class="icon icon-star" /> 
            </icon-button>
            <icon-button v-else @click="setStarredStatus(true)" :title="'Mark Translation'">
                <span class="icon icon-star-empty" />
            </icon-button>
        </div>
        <div class="translation">
            <span v-if="!!sentence.translation"> {{ sentence.translation }} </span>
            <span v-else class="no-translation"> No Translation </span>
        </div>
        <div class="play-text">
            <icon-button @click="playText" :title="'Play Origin'" >
                <i class="play" />
            </icon-button>
        </div>
        <div class="origin-holder">
            <div class="origin" @blur="translateText($event.target.innerText)" @keydown.enter.prevent="translateText($event.target.innerText)" contenteditable="true" tabindex="0">{{ sentence.origin }}</div>
            <div class="origin-actions">
                <span v-if="isInputCorrected">(corrected from <link-button @click="forceTranslation" :text="sentence.input" />)</span>
                <span v-if="hasSuggestion">(maybe you meant <link-button @click="translateSuggestion" :text="sentence.suggestion" />)</span>
                <span v-if="!!sentence.transcription">[{{sentence.transcription}}]</span>
            </div>
        </div>
    </div>
</template>

<script src="./TranslationResultHeader.ts" lang="ts"></script>
<style src="./TranslationResultHeader.scss" lang="scss" scoped></style>
