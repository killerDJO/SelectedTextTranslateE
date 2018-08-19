<template>
    <div class="definitions">
        <div class="definition-header">{{definitionCategory.baseForm}} <span class="part-of-speech">- {{definitionCategory.partOfSpeech}}</span></div>
        <div v-for="entry in definitionCategory.entries" :key="entry.definition" class="definition-entry">
            <div class="definition">{{entry.definition}}</div>
            <div class="sample" v-if="!!entry.sample">{{entry.sample}}</div>
            <div class="synonyms" v-if="!!entry.synonyms.length"><span class="synonyms-label">synonyms: </span>{{entry.synonyms.join(", ")}}</div>
        </div>
    </div>
</template>

<script src="./TranslationResultDefinitionCategory.ts" lang="ts"></script>
<style src="./TranslationResultDefinitionCategory.scss" lang="scss" scoped></style>