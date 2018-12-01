<template>
  <div class="datepicker-holder">
    <vuejs-datepicker
      ref="datepicker"
      class="datepicker"
      :value="value$"
      @selected="value$ = $event"
      :highlighted="highlightedDates"
      :disabledDates="disabledDates"
      :placeholder="'Click to select date'"
      :format="dateFormatter"
      :monday-first="true"
      :bootstrap-styling="true"
      :calendar-class="'calendar'" />
    <icon-button @click="clear()" :title="'Clear Date'" class="clear-icon">
        <span class="icon icon-cancel" />
    </icon-button>
  </div>
</template>

<script src="./Datepicker.ts" lang="ts"></script>
<style src="./Datepicker.scss" lang="scss" scoped></style>