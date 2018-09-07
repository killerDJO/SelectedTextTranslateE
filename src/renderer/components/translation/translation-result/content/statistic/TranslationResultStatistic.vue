<template>
    <div class="statistic">
        <div class="item">Times Translated<span class="item-value"> - {{historyRecord.translationsNumber}}</span></div>
        <div class="item">First Translated<span class="item-value"> - {{historyRecord.createdDate | date-time}}</span></div>
        <div class="item">Last Translated<span class="item-value"> - {{historyRecord.lastTranslatedDate | date-time}}</span></div>
        <div class="item">Last Updated<span class="item-value"> - {{historyRecord.updatedDate | date-time}}</span></div>
        <span class="link-button" @click="refreshTranslation">Refresh</span>
    </div>
</template>

<script src="./TranslationResultStatistic.ts" lang="ts"></script>
<style src="./TranslationResultStatistic.scss" lang="scss" scoped></style>