<template>
    <div class="content">
        <div v-for="category in categories" :key="category.partOfSpeech" class="category">
            <div class="category-header">{{category.baseForm}} <span class="part-of-speech">- {{category.partOfSpeech}}</span></div>
            <div v-for="entry in category.entries" :key="entry.word" class="category-entry">
                <span class="score" :class="getScoreClass(entry)"></span> {{entry.word}} <span class="reverse-translations">- {{entry.reverseTranslations.join(", ")}}</span>
            </div>
        </div>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
