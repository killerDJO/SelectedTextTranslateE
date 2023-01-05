import type { Directive } from 'vue';
import tippy, { type Instance } from 'tippy.js';

const instancesMap: Map<HTMLElement, Instance> = new Map();

export const overflowTooltipDirective: Directive = {
  beforeMount: (element: HTMLElement) => {
    const tippyInstance = tippy(element, {
      content: element.innerText,
      onShow() {
        if (!isOverflown(element)) {
          return false;
        }
      }
    });
    instancesMap.set(element, tippyInstance);
  },
  unmounted: (element: HTMLElement) => {
    instancesMap.get(element)?.destroy();
  }
};

function isOverflown(element: HTMLElement): boolean {
  return element.offsetWidth < element.scrollWidth;
}
