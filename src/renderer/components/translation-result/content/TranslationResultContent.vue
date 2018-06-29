<template>
    <div class="content">
        <translation-result-content-category 
            v-for="category in categories"
            :key="category.baseForm + category.partOfSpeech"
            :category="category"
            :presentation-settings="presentationSettings"/>
    </div>
</template>

<script src="./TranslationResultContent.ts" lang="ts"></script>
<style src="./TranslationResultContent.scss" lang="scss" scoped></style>
