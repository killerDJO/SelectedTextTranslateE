<template>
    <div class="category">
        <div class="category-header">{{category.baseForm}} <span class="part-of-speech">- {{category.partOfSpeech}}</span></div>
        <div v-for="entry in visibleEntries" :key="entry.word" class="category-entry">
            <span class="score" :class="getScoreClass(entry)"></span>{{entry.word}}
            <span class="reverse-translations">-
                <span v-for="(reverseTransltion, index) in entry.reverseTranslations" :key="reverseTransltion">
                    <span class="reverse-translation" @click="translate(reverseTransltion)">{{reverseTransltion}}</span>{{index !== entry.reverseTranslations.length - 1 ? ", " : ""}}
                </span>
            </span>
        </div>
        <a v-if="hasInitiallyHiddenEntries" class="expand link-button" @click="toggleExpansionState" v-tab-index>{{ expandButtonText }}</a>
    </div>
</template>

<script src="./TranslationResultContentCategory.ts" lang="ts"></script>
<style src="./TranslationResultContentCategory.scss" lang="scss" scoped></style>
