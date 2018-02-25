<template>
  <div>
    <div class="translate-result">
      <div class="header">
        <div v-if="hasResult" class="sentence">
          <div class="translation">{{ translateResult.sentence.translation }}</div>
          <div class="origin">{{ translateResult.sentence.origin }}</div>
        </div>
        <div v-else>Please select text to translate</div>
      </div>
      <div class="body" v-if="hasResult">
        <div v-for="category in translateResult.categories" :key="category.partOfSpeech" class="category">
          <div class="category-header">{{category.baseForm}} <span class="part-of-speech">- {{category.partOfSpeech}}</span></div>
          <div v-for="entry in category.entries" :key="entry.word" class="category-entry">
            <span class="score" :class="getScoreClass(entry)"></span> {{entry.word}} <span class="reverse-translations">- {{entry.reverseTranslations.join(", ")}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TranslationResult.ts" lang="ts"></script>
<style src="./TranslationResult.scss" lang="scss" scoped></style>
