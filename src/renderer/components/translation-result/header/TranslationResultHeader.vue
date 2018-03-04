<template>
    <div class="header">
        <div class="translation">{{ sentence.translation }}</div>
        <i class="play" @click="playText"></i><div class="origin">{{ sentence.origin }}</div>
    </div>
</template>

<script src="./TranslationResultHeader.ts" lang="ts"></script>
<style src="./TranslationResultHeader.scss" lang="scss" scoped></style>
