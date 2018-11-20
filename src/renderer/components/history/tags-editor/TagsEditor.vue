<template>
  <div class="tags-editor" :class="{'compact': compactView}">
    <span class="no-tags" v-if="currentTags.length === 0 && !isTagInputVisible">[No Tags]</span>
    <span class="tag" v-else v-for="tag in currentTags" :key="tag">
      {{tag}}
      <icon-button @click="removeTag(tag)" :title="'Remove Tag'" class="remove-tag-holder">
        <span class="icon icon-cancel" />
      </icon-button>
    </span>
    <icon-button @click="showTagInput()" :title="'Add Tag'" v-if="!isTagInputVisible" class="add-tag-holder">
        <span class="icon icon-plus" />
    </icon-button>
    <div class="tag-input-wrapper" v-focus-lost="hideTagInput">
      <input type="text" class="tag-input" v-if="isTagInputVisible" v-model="tagToAdd" @keydown.enter.stop="addTag" v-tab-index v-auto-focus/>
      <icon-button @click="addTag()" :title="'Add Tag'" v-if="isTagInputVisible" class="confirm-add-tag-holder">
          <span class="icon icon-check" />
      </icon-button>
    </div>
  </div>
</template>

<script src="./TagsEditor.ts" lang="ts"></script>
<style src="./TagsEditor.scss" lang="scss" scoped></style>
