<template>
    <div class="statistic">
        <li class="item">Times translated<span class="item-value"> - {{historyRecord.translationsNumber}}</span></li>
        <li class="item">First translated<span class="item-value"> - {{historyRecord.createdDate | date-time}}</span></li>
        <li class="item">Last translated<span class="item-value"> - {{historyRecord.lastTranslatedDate | date-time}}</span></li>
        <li class="item">Last updated<span class="item-value"> - {{historyRecord.updatedDate | date-time}}</span></li>
        <link-button @click="refreshTranslation" :text="'Refresh'" />
    </div>
</template>

<script src="./TranslationResultStatistic.ts" lang="ts"></script>
<style src="./TranslationResultStatistic.scss" lang="scss" scoped></style>