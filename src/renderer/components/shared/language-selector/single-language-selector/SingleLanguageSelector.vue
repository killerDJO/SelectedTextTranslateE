<template>
  <select class="form-control" v-model="selectedLanguage$">
    <option v-for="language in allLanguages" :value="language.value" :key="language.value">
      {{ language.name }}
    </option>
  </select>
</template>

<script src="./SingleLanguageSelector.ts" lang="ts"></script>
<style src="./SingleLanguageSelector.scss" lang="scss" scoped></style>