<template>
    <div class="category">
        <div class="category-header">{{category.baseForm}} <span class="part-of-speech">- {{category.partOfSpeech}}</span></div>
        <div v-for="entry in visibleEntries" :key="entry.word" class="category-entry">
            <span class="score" :class="getScoreClass(entry)"></span> {{entry.word}} <span class="reverse-translations">- {{entry.reverseTranslations.join(", ")}}</span>
        </div>
        <a v-if="hasInitiallyHiddenEntries" class="expand button" @click="toggleExpansionState">{{ expandButtonText }}</a>
    </div>
</template>

<script src="./ContentCategory.ts" lang="ts"></script>
<style src="./ContentCategory.scss" lang="scss" scoped></style>
