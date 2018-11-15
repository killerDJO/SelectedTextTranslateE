<template>
    <div class="translation-input form-group">
        <label>Input text and press Enter to translate</label>
        <div class="input-holder">
            <input class="form-control" type="text" v-auto-focus autofocus v-model="text" @keydown.enter="translate()"/>
            <icon-button @click="playText()" :title="'Play'" class="play-icon-holder">
                <span class="play-icon" />
            </icon-button>
        </div>
    </div>
</template>

<script src="./TranslationInput.ts" lang="ts"></script>
<style src="./TranslationInput.scss" lang="scss" scoped></style>