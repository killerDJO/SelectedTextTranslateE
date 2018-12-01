<template>
  <div class="language-input settings-item">
    <single-language-selector :selected-language.sync="currentLanguages.sourceLanguage" :all-languages="sourceLanguages"/>
    <div><icon-button :title="'Switch'" @click="switchLanguages"><i class="icon icon-switch"></i></icon-button></div>
    <single-language-selector :selected-language.sync="currentLanguages.targetLanguage" :all-languages="targetLanguages"/>
  </div>
</template>

<script src="./LanguageSelector.ts" lang="ts"></script>
<style src="./LanguageSelector.scss" lang="scss" scoped></style>