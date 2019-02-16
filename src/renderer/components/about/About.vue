<template>
    <div class="about" v-if="isInitialized">
        <p class="about-title">{{info.name}}</p>
        <p class="version-holder"><span class="version">{{info.version}}</span> <link-button :text="'Check for Updates'" @click="checkForUpdates"/></p>
        <a :href="info.homepage" @click.prevent="openHomePage">Home Page</a>
    </div>
</template>

<script src="./About.ts" lang="ts"></script>
<style src="./About.scss" lang="scss" scoped></style>
