<template>
  <settings-holder :title="'Language'">
    <div class="language-input settings-item">
      <select class="form-control" v-model="currentLanguageSettings.sourceLanguage">
        <option v-for="language in sourceLanguages" :value="language.code" :key="language.code">
          {{ language.name }}
        </option>
      </select>
      <div><icon-button :title="'Switch'" @click="switchLanguages"><i class="icon icon-switch"></i></icon-button></div>
      <select class="form-control" v-model="currentLanguageSettings.targetLanguage">
        <option v-for="language in targetLanguages" :value="language.code" :key="language.code">
          {{ language.name }}
        </option>
      </select>
    </div>
  </settings-holder>
</template>

<script src="./LanguageSettings.ts" lang="ts"></script>
<style src="./LanguageSettings.scss" lang="scss" scoped></style>