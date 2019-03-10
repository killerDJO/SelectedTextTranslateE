<template>
  <div class="drop-wrapper" :class="{'compact': compactView}" ref="dropTarget" v-focus-lost="closeDrop" @click.stop.prevent>
    <input type="text"
      ref="input"
      v-model="input$"
      v-auto-focus="autoFocus"
      v-tab-index="tabIndex"
      @keydown.ctrl.space="requestSuggestions"
      @keydown.enter.stop="onSelected"
      @keydown.up.stop.prevent="selectPreviousSuggestion"
      @keydown.down.stop.prevent="selectNextSuggestion"/>

    <div ref="dropContent" class="drop-content">
      <ul class="drop-items">
        <li
          class="drop-item"
          :class="{'selected': isSuggestionSelected(suggestion)}"
          v-for="suggestion in suggestions"
          tabindex="0"
          :key="suggestion"
          @click.stop.prevent="suggestionClick(suggestion)">
          {{suggestion}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./Typeahead.ts" lang="ts"></script>
<style src="./Typeahead.scss" lang="scss" scoped></style>