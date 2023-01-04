import type { Directive } from 'vue';

const FOCUS_DELAY_MILLISECONDS = 100;
const MAX_NUMBER_OF_TRIES = 10;

export const autoFocusDirective: Directive = {
  mounted: (element: HTMLElement) => {
    setTimeout(() => trySetFocus(element));
  }
};

function trySetFocus(el: HTMLElement, iteration: number = 0): void {
  el.focus();
  if (document.activeElement !== el && iteration < MAX_NUMBER_OF_TRIES) {
    setTimeout(() => trySetFocus(el, iteration + 1), FOCUS_DELAY_MILLISECONDS);
  }
}
