<template>
    <div class="translation-input form-group">
        <label>Input text and press Enter to translate</label>
        <input class="form-control" type="text" v-model="text" @keydown.enter="translate()"/>
    </div>
</template>

<script src="./TranslationInput.ts" lang="ts"></script>
<style src="./TranslationInput.scss" lang="scss" scoped></style>