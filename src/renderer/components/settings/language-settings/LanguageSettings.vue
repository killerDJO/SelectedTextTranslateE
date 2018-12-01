<template>
  <div class="language-input settings-item">
    <language-selector
      :languages="selectedLanguages"
      :all-languages="languageSettings.allLanguages"
      @languages-updated="onLanguagesUpdated"/>
  </div>
</template>

<script src="./LanguageSettings.ts" lang="ts"></script>
<style src="./LanguageSettings.scss" lang="scss" scoped></style>