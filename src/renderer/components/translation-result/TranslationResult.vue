<template>
  <div>
    <div class="header">
      <div v-if="hasResult">
        <div class="translation">{{ translateResult.sentence.translation }}</div>
        <div class="origin">{{ translateResult.sentence.origin }}</div>
      </div>
      <div v-else>Please select text to translate</div>
    </div>
    <div class="body" v-if="hasResult">
      <div v-for="category in translateResult.categories" :key="category.partOfSpeech" class="category">
        <div class="category-header">{{category.baseForm}} - {{category.partOfSpeech}}</div>
        <div v-for="entry in category.entries" :key="entry.word" class="category-entry">
          {{entry.word}} -
          <span v-for="reverseTranslation in entry.reverseTranslations" :key="reverseTranslation" class="reverse-translation">{{reverseTranslation}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
