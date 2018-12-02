<template>
  <select class="form-control" v-model="selectedLanguage$" :class="{'default-selected': !selectedLanguage$}">
    <option v-for="language in allLanguages" :value="language.value" :key="language.value" class="language-option" :class="{'default': !language.value}">
      {{ language.name }}
    </option>
  </select>
</template>

<script src="./SingleLanguageSelector.ts" lang="ts"></script>
<style src="./SingleLanguageSelector.scss" lang="scss" scoped></style>