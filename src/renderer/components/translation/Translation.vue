<template>
    <div class="translation" v-if="isInitialized">
        <div v-if="showInput">
            <translation-input @translate-text="translateText"/>
        </div>
        <translation-result
            v-else-if="hasResult || isInProgress"
            :default-view="defaultView"
            :history-record="historyRecord"
            :is-in-progress="isInProgress"
            :translation-result-view-settings="translationResultViewSettings"
            @translate-suggestion="translateSuggestion"
            @force-translation="forceTranslation"
            @translate-text="translateText"
            @play-text="playText"
            @set-starred-status="setStarredStatus"/>
        <div v-else>
            <div  class="no-text-data">No text data selected</div>
            <translation-input @translate-text="translateText"/>
        </div>
    </div>
</template>

<script src="./Translation.ts" lang="ts"></script>
<style src="./Translation.scss" lang="scss" scoped></style>
